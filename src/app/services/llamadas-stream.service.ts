import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Llamada } from '../models/llamada.model';
import { LlamadasHttpService } from './llamadas-http.service';
import { getCallsStreamEndpoint } from '../config/api.config';

interface CallStreamData {
  type: 'new' | 'update' | 'status' | 'error';
  data: any;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LlamadasStreamService {
  private http = inject(HttpClient);
  private httpService = inject(LlamadasHttpService);

  private eventSource: EventSource | null = null;
  private isConnected = signal(false);
  private lastError = signal<string | null>(null);
  private streamEvents = signal<CallStreamData[]>([]);

  readonly isStreamConnected = this.isConnected.asReadonly();
  readonly errorMessage = this.lastError.asReadonly();
  readonly events = this.streamEvents.asReadonly();

  connectStream(
    onNewCall: (llamada: Llamada) => void,
    onUpdateCall: (llamada: Llamada) => void,
    onStatus: (status: any) => void
  ): void {
    const streamUrl = getCallsStreamEndpoint();

    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.addEventListener('new-call', (event: MessageEvent) => {
        this.handleCallEvent(event, 'new', onNewCall, onUpdateCall);
      });

      this.eventSource.addEventListener('update-call', (event: MessageEvent) => {
        this.handleCallEvent(event, 'update', onNewCall, onUpdateCall);
      });

      this.eventSource.addEventListener('status', (event: MessageEvent) => {
        try {
          const statusData = JSON.parse(event.data);
          console.log('📡 GET /api/calls/stream (status) →', statusData);
          this.recordEvent({
            type: 'status',
            data: statusData,
            timestamp: new Date().toISOString()
          });
          onStatus(statusData);
        } catch (error) {
          console.log('📡 GET /api/calls/stream → Error parseando status');
        }
      });

      this.eventSource.onmessage = (event: MessageEvent) => {
        try {
          const callData = JSON.parse(event.data);
          console.log('📡 GET /api/calls/stream →', callData);
          const llamada = this.httpService.mapBackendToLlamada(callData, 0);
          this.recordEvent({
            type: 'new',
            data: llamada,
            timestamp: new Date().toISOString()
          });
          onNewCall(llamada);
        } catch (error) {
          console.log('📡 GET /api/calls/stream → Error parseando datos');
        }
      };

      this.eventSource.onerror = (error) => {
        const errorMsg = `Conexión stream perdida: ${error}`;
        this.lastError.set(errorMsg);
        this.recordEvent({
          type: 'error',
          data: { message: errorMsg, error },
          timestamp: new Date().toISOString()
        });

        if (this.eventSource?.readyState === EventSource.CLOSED) {
          this.isConnected.set(false);
        }
      };

      this.eventSource.onopen = () => {
        this.isConnected.set(true);
        this.lastError.set(null);
      };

    } catch (error) {
      this.lastError.set(`Error al conectar stream: ${error}`);
      this.recordEvent({
        type: 'error',
        data: { message: 'Error de inicialización', error },
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleCallEvent(
    event: MessageEvent,
    eventType: 'new' | 'update',
    onNewCall: (llamada: Llamada) => void,
    onUpdateCall: (llamada: Llamada) => void
  ): void {
    try {
      const callData = JSON.parse(event.data);
      console.log(`📡 GET /api/calls/stream (${eventType}-call) →`, callData);
      const llamada = this.httpService.mapBackendToLlamada(callData, 0);
      this.recordEvent({
        type: eventType,
        data: llamada,
        timestamp: new Date().toISOString()
      });
      if (eventType === 'new') {
        onNewCall(llamada);
      } else {
        onUpdateCall(llamada);
      }
    } catch (error) {
      console.log(`📡 GET /api/calls/stream → Error parseando ${eventType}-call`);
    }
  }

  disconnectStream(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected.set(false);
    }
  }

  private recordEvent(event: CallStreamData): void {
    this.streamEvents.update(events => [
      event,
      ...events.slice(0, 99)
    ]);
  }

  getEventHistory(): CallStreamData[] {
    return this.streamEvents();
  }

  clearEventHistory(): void {
    this.streamEvents.set([]);
  }

  getConnectionStatus(): {
    connected: boolean;
    error: string | null;
    eventCount: number;
    timestamp: string;
  } {
    return {
      connected: this.isConnected(),
      error: this.lastError(),
      eventCount: this.streamEvents().length,
      timestamp: new Date().toISOString()
    };
  }
}
