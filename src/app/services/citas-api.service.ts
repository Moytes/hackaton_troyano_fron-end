import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, timeout, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Cita {
  id: number;
  createdAt: string;
  doctorId: number;
  pacienteId: string;
  pacienteTelefono: string;
  pacienteNombre: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  motivo: string;
  estado: 'confirmada' | 'cancelada' | 'completada' | 'pendiente';
}

@Injectable({
  providedIn: 'root'
})
export class CitasApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiCitasUrl;
  
  // Timeout configurable (10 segundos para manejar cold starts pesados)
  private readonly DEFAULT_TIMEOUT = 10000;

  private citasSubject = new BehaviorSubject<Cita[]>([]);
  citas$ = this.citasSubject.asObservable();

  obtenerTodasLasCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      tap(citas => this.citasSubject.next(citas)),
      catchError(err => {
        console.error('❌ [API] Error obteniendo todas las citas:', err);
        return throwError(() => err);
      })
    );
  }

  obtenerCitaPorId(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      catchError(err => {
        console.error(`❌ [API] Error obteniendo cita ${id}:`, err);
        return throwError(() => err);
      })
    );
  }

  obtenerCitasPorDoctor(doctorId: number): Observable<Cita[]> {
    // Seguridad: Limpiamos la URL para asegurar que termine en /api/citas
    // si el environment trae algo como .../api/citas/1
    let baseUrl = this.apiUrl || 'https://hackaton-ms-citas-production.up.railway.app/api/citas';
    
    if (baseUrl.includes('/api/citas')) {
      baseUrl = baseUrl.split('/api/citas')[0] + '/api/citas';
    }

    const url = `${baseUrl}?doctorId=${doctorId}`;
    
    console.log('🚀 [API] Petición de Citas para Doctor:', doctorId);
    console.log('🔗 URL Final:', url);

    return this.http.get<Cita[]>(url).pipe(
      timeout(this.DEFAULT_TIMEOUT),
      tap(response => {
        console.log('✅ [API] Citas recuperadas:', response?.length || 0);
      }),
      catchError(err => {
        console.error(`❌ [API] Error (Timeout/Network) para Doctor ${doctorId}:`, err);
        return throwError(() => err);
      })
    );
  }
}

