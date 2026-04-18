import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Llamada } from '../models/llamada.model';
import { getCallsEndpoint, getCallsByUserEndpoint, getCreateEmergencyEndpoint } from '../config/api.config';

interface CallFromBackend {
  id: string;
  userId: string;
  callType: string;
  status: string;
  classification: string;
  transcriptions: any[];
  summaryMarkdown: string;
  durationSeconds: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class LlamadasHttpService {
  constructor(private http: HttpClient) {}

  getAllCalls(): Observable<CallFromBackend[]> {
    const url = getCallsEndpoint();
    console.log('🔵 [HTTP] Obteniendo ALL CALLS desde:', url);
    return this.http.get<CallFromBackend[]>(url).pipe(
      tap(calls => {
        console.log('✅ [HTTP] Respuesta de ALL CALLS:', calls);
        console.log('📊 Total llamadas recibidas:', calls.length);
        if (calls.length > 0) {
          console.log('📌 Primera llamada (muestra):', calls[0]);
          console.log('🏷️  Clasificaciones encontradas:', calls.map(c => c.classification));
        }
      })
    );
  }

  getCallsByUserId(userId: string): Observable<CallFromBackend[]> {
    const url = getCallsByUserEndpoint(userId);
    console.log('🔵 [HTTP] Obteniendo CALLS POR USUARIO:', userId, 'URL:', url);
    return this.http.get<CallFromBackend[]>(url).pipe(
      tap(calls => {
        console.log('✅ [HTTP] Respuesta de CALLS POR USUARIO:', calls);
        console.log('📊 Total llamadas para usuario:', calls.length);
      })
    );
  }

  getCallsByClassification(classification: string): Observable<CallFromBackend[]> {
    const url = `${getCallsEndpoint()}/classification/${classification}`;
    console.log('🔵 [HTTP] Obteniendo CALLS POR CLASIFICACIÓN:', classification, 'URL:', url);
    return this.http.get<CallFromBackend[]>(url).pipe(
      tap(calls => {
        console.log('✅ [HTTP] Respuesta de CALLS POR CLASIFICACIÓN:', calls);
        console.log('📊 Total llamadas con clasificación', classification + ':', calls.length);
      })
    );
  }

  createEmergencyCall(): Observable<CallFromBackend> {
    const url = getCreateEmergencyEndpoint();
    console.log('🔴 [HTTP] CREAR LLAMADA DE EMERGENCIA - URL:', url);
    return this.http.post<CallFromBackend>(url, {}).pipe(
      tap(call => {
        console.log('✅ [HTTP] Emergencia creada exitosamente:', call);
        console.log('📌 Emergencia ID:', call.id);
        console.log('🚨 Classification:', call.classification);
        console.log('⏱️  Status:', call.status);
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
      'VERDE': 'leve'
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
      'cancelled': 'cancelada'
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
      'reminder': 'recordatorio'
    };

    const createdDate = new Date(call.createdAt);
    const userIdShort = call.userId ? call.userId.substring(0, 8) : `Call-${call.id.substring(0, 8)}`;

    // Determinar clasificación: si es EMERGENCY o classification es GRAVE
    const clasificacion = clasificacionMap[call.classification] ||
                          (call.callType === 'EMERGENCY' || call.callType === 'emergency' ? 'grave' : 'normal');

    // Determinar tipo: si classification es GRAVE, es emergencia
    const tipo = tipoMap[call.callType] ||
                 (call.classification === 'GRAVE' || call.classification === 'grave' ? 'emergencia' : 'consulta');

    const llamadaMapeada = {
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
      horaFin: new Date(createdDate.getTime() + (call.durationSeconds || 0) * 1000)
    };

    console.log(`🔄 [MAPEO #${index}] Call Backend:`, {
      id: call.id,
      classification_original: call.classification,
      callType: call.callType,
      status: call.status
    });
    console.log(`✨ [MAPEO #${index}] Llamada Mapeada:`, {
      id: llamadaMapeada.id,
      clasificacion: llamadaMapeada.clasificacion,
      estado: llamadaMapeada.estado,
      tipo: llamadaMapeada.tipo
    });

    return llamadaMapeada;
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
