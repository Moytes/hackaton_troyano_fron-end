import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Llamada } from '../models/llamada.model';
import { FechaService } from './fecha.service';
import { getCallsEndpoint, getCallsByUserEndpoint, getCreateEmergencyEndpoint } from '../config/api.config';

interface CallFromBackend {
  id: string;
  userId: string;
  callType: string;
  status: string;
  classification: string;
  patientName?: string;
  latitud?: string;
  longitud?: string;
  transcriptions: any[];
  summaryMarkdown: string;
  durationSeconds: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class LlamadasHttpService {
  private http = inject(HttpClient);
  private fechaService = inject(FechaService);

  getAllCalls(): Observable<CallFromBackend[]> {
    const url = getCallsEndpoint();
    return this.http.get<CallFromBackend[]>(url).pipe(
      tap(calls => {
        console.log('📡 GET /api/calls →', calls);
        if (calls.length > 0) {
          const sorted = [...calls].sort((a, b) =>
            this.fechaService.parseDate(b.createdAt).getTime() - this.fechaService.parseDate(a.createdAt).getTime()
          );
          const first = sorted[0];
          const raw = first.createdAt;
          const parsedUTC = this.fechaService.parseDate(raw);
          const horaLocal = this.fechaService.formatFechaHora(parsedUTC);
          
          console.log('⏰ DIAGNÓSTICO FECHA (MÁS RECIENTE):', {
            id: first.id,
            rawBackend: raw,
            parsedUTC: parsedUTC.toISOString(),
            formateadoMexico: horaLocal,
            callType: first.callType
          });
        }
      })
    );
  }

  getCallsByUserId(userId: string): Observable<CallFromBackend[]> {
    const url = getCallsByUserEndpoint(userId);
    return this.http.get<CallFromBackend[]>(url).pipe(
      tap(calls => {
        console.log('📡 GET /api/calls/user/:userId →', calls);
      })
    );
  }

  getCallsByClassification(classification: string): Observable<CallFromBackend[]> {
    const url = `${getCallsEndpoint()}/classification/${classification}`;
    return this.http.get<CallFromBackend[]>(url).pipe(
      tap(calls => {
        console.log('📡 GET /api/calls/classification/:classification →', calls);
      })
    );
  }

  createEmergencyCall(): Observable<CallFromBackend> {
    const url = getCreateEmergencyEndpoint();
    return this.http.post<CallFromBackend>(url, {}).pipe(
      tap(call => {
        console.log('📡 POST /api/calls/emergency →', call);
      })
    );
  }

  mapBackendToLlamada(call: CallFromBackend, index: number): Llamada {
    // Mapeos de clasificación (severidad)
    const clasificacionMap: Record<string, 'grave' | 'moderado' | 'leve' | 'normal'> = {
      'grave': 'grave',
      'moderado': 'moderado',
      'leve': 'leve',
      'normal': 'normal',
      'GRAVE': 'grave',
      'MODERADO': 'moderado',
      'LEVE': 'leve',
      'NORMAL': 'normal',
      'EMERGENCY': 'grave',
      'emergency': 'grave',
      'roja': 'grave',
      'ROJA': 'grave',
      'amarilla': 'moderado',
      'AMARILLA': 'moderado',
      'verde': 'leve',
      'VERDE': 'leve',
      'sin_clasificar': 'grave'
    };

    // Mapeos de estado (flujo)
    const estadoMap: Record<string, 'entrante' | 'en_proceso' | 'escalada' | 'resuelta' | 'cancelada'> = {
      'PENDING': 'entrante',
      'IN_PROGRESS': 'en_proceso',
      'ESCALATED': 'escalada',
      'RESOLVED': 'resuelta',
      'CANCELLED': 'cancelada',
      'pending': 'entrante',
      'in_progress': 'en_proceso',
      'escalated': 'escalada',
      'resolved': 'resuelta',
      'cancelled': 'cancelada',
      'en_curso': 'en_proceso'
    };

    // Mapeos de tipo (categoría)
    const tipoMap: Record<string, 'emergencia' | 'consulta' | 'seguimiento' | 'recordatorio'> = {
      'EMERGENCY': 'emergencia',
      'CONSULTATION': 'consulta',
      'FOLLOW_UP': 'seguimiento',
      'REMINDER': 'recordatorio',
      'emergency': 'emergencia',
      'consultation': 'consulta',
      'follow_up': 'seguimiento',
      'reminder': 'recordatorio',
      'boton': 'emergencia'
    };

    const createdDate = this.fechaService.parseDate(call.createdAt);
    const userIdShort = call.userId ? call.userId.substring(0, 8) : `Call-${call.id.substring(0, 8)}`;

    const clasificacion = clasificacionMap[call.classification] ||
                          (call.callType === 'EMERGENCY' || call.callType === 'emergency' ? 'grave' : 'normal');

    const tipo = tipoMap[call.callType] ||
                 (call.classification === 'GRAVE' || call.classification === 'grave' ? 'emergencia' : 'consulta');

    return {
      id: call.id,
      pacienteId: call.userId || '',
      pacienteNombre: `Paciente ${userIdShort}`,
      clasificacion: clasificacion,
      nivelTriage: this.calcularNivelTriage(clasificacion),
      estado: estadoMap[call.status] || 'entrante',
      tipo: tipo,
      sintomasIniciales: call.summaryMarkdown?.split('\n').slice(0, 3) || [],
      descripcion: call.summaryMarkdown || 'Sin descripción',
      duracion: call.durationSeconds,
      resumenIA: call.summaryMarkdown,
      recomendacionesIA: call.summaryMarkdown?.split('\n').slice(3, 6) || [],
      horaInicio: createdDate,
      horaFin: new Date(createdDate.getTime() + (call.durationSeconds || 0) * 1000),
      transcriptions: (call.transcriptions || []).map(t => ({
        ...t,
        ts: this.fechaService.parseDate(t.ts).toISOString()
      }))
    };
  }

  private calcularNivelTriage(clasificacion: 'grave' | 'moderado' | 'leve' | 'normal'): 1 | 2 | 3 | 4 | 5 {
    const nivelMap: Record<'grave' | 'moderado' | 'leve' | 'normal', 1 | 2 | 3 | 4 | 5> = {
      'grave': 1,
      'moderado': 2,
      'leve': 3,
      'normal': 5
    };
    return nivelMap[clasificacion] || 3;
  }
}
