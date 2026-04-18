import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, timeout, catchError, throwError } from 'rxjs';
import { Llamada } from '../models/llamada.model';
import { Paciente } from '../models/paciente.model';
import { FechaService } from './fecha.service';
import { getCallsEndpoint, getCallsByUserEndpoint, getCreateEmergencyEndpoint, getUserEndpoint } from '../config/api.config';

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

interface UserFromBackend {
  id: string;
  familyGroupId?: string;
  phoneNumber: string;
  name: string;
  municipality: string;
  address: string;
  birthDate: string;
  gender?: string;
  chronicConditions: any[];
  medications: any[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  mainSummary?: string;
  isOnboarded: boolean;
  callCount: number;
  createdAt: string;
  updatedAt: string;
}

interface UserWithLastCallResponse {
  user: UserFromBackend;
  lastCall: CallFromBackend;
}

@Injectable({
  providedIn: 'root'
})
export class LlamadasHttpService {
  private http = inject(HttpClient);
  private fechaService = inject(FechaService);
  private readonly DEFAULT_TIMEOUT = 10000;

  getAllCalls(): Observable<CallFromBackend[]> {
    const url = getCallsEndpoint();
    return this.http.get<CallFromBackend[]>(url).pipe(
      timeout(this.DEFAULT_TIMEOUT),
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
      }),
      catchError(err => {
        console.error('❌ [API] Error obteniendo todas las llamadas:', err);
        return throwError(() => err);
      })
    );
  }

  getCallsByUserId(userId: string): Observable<CallFromBackend[]> {
    const url = getCallsByUserEndpoint(userId);
    return this.http.get<CallFromBackend[]>(url).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      tap(calls => {
        console.log('📡 GET /api/calls/user/:userId →', calls);
      }),
      catchError(err => {
        console.error(`❌ [API] Error obteniendo llamadas para usuario ${userId}:`, err);
        return throwError(() => err);
      })
    );
  }

  getCallsByClassification(classification: string): Observable<CallFromBackend[]> {
    const url = `${getCallsEndpoint()}/classification/${classification}`;
    return this.http.get<CallFromBackend[]>(url).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      tap(calls => {
        console.log('📡 GET /api/calls/classification/:classification →', calls);
      }),
      catchError(err => {
        console.error(`❌ [API] Error obteniendo llamadas por clasificación ${classification}:`, err);
        return throwError(() => err);
      })
    );
  }

  createEmergencyCall(): Observable<CallFromBackend> {
    const url = getCreateEmergencyEndpoint();
    return this.http.post<CallFromBackend>(url, {}).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      tap(call => {
        console.log('📡 POST /api/calls/emergency →', call);
      }),
      catchError(err => {
        console.error('❌ [API] Error creando llamada de emergencia:', err);
        return throwError(() => err);
      })
    );
  }

  getUserById(userId: string): Observable<UserWithLastCallResponse> {
    const url = getUserEndpoint(userId);
    return this.http.get<UserWithLastCallResponse>(url).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      tap(res => {
        console.log('📡 GET /api/users/:id →', res);
      }),
      catchError(err => {
        console.error(`❌ [API] Error obteniendo usuario ${userId}:`, err);
        return throwError(() => err);
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

    const clasificacion = clasificacionMap[call.classification] ||
                          (call.callType === 'EMERGENCY' || call.callType === 'emergency' ? 'grave' : 'normal');

    const tipo = tipoMap[call.callType] ||
                 (call.classification === 'GRAVE' || call.classification === 'grave' ? 'emergencia' : 'consulta');

    return {
      id: call.id,
      pacienteId: call.userId || '',
      pacienteNombre: call.patientName || 'Cargando...',
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

  mapUserToPaciente(user: UserFromBackend): Paciente {
    const birthDate = this.fechaService.parseDate(user.birthDate);
    const registroDate = this.fechaService.parseDate(user.createdAt);

    const calcularEdad = (fecha: Date): number => {
      const hoy = new Date();
      let edad = hoy.getFullYear() - fecha.getFullYear();
      const mes = hoy.getMonth() - fecha.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
        edad--;
      }
      return edad;
    };

    return {
      id: user.id,
      nombre: user.name.split(' ')[0] || user.name,
      apellidoPaterno: user.name.split(' ')[1] || '',
      apellidoMaterno: user.name.split(' ')[2] || '',
      fechaNacimiento: birthDate,
      edad: calcularEdad(birthDate),
      genero: (user.gender === 'M' ? 'M' : user.gender === 'F' ? 'F' : 'Otro') as 'M' | 'F' | 'Otro',
      telefono: user.phoneNumber,
      telefonoEmergencia: user.emergencyContactPhone,
      direccion: user.address,
      comunidad: user.municipality,
      tipoSangre: 'O+',
      enfermedadesCronicas: Array.isArray(user.chronicConditions) ? user.chronicConditions.filter(c => typeof c === 'string') : [],
      alergias: [],
      medicamentos: Array.isArray(user.medications) ? user.medications.filter(m => typeof m === 'string') : [],
      cirugias: [],
      fechaRegistro: registroDate,
      ultimoContacto: registroDate
    };
  }
}
