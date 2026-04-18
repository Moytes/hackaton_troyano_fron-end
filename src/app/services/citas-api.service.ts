import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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

  private citasSubject = new BehaviorSubject<Cita[]>([]);
  citas$ = this.citasSubject.asObservable();

  obtenerTodasLasCitas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(this.apiUrl).pipe(
      tap(citas => this.citasSubject.next(citas))
    );
  }

  obtenerCitaPorId(id: number): Observable<Cita> {
    return this.http.get<Cita>(`${this.apiUrl}/${id}`);
  }

  obtenerCitasPorDoctor(doctorId: number): Observable<Cita[]> {
    // Seguridad: Evitamos el crash si apiUrl es undefined
    const safeUrl = this.apiUrl || 'https://hackaton-ms-citas-production.up.railway.app/api/citas';
    
    let baseUrl = safeUrl;
    if (safeUrl.includes('/api/citas')) {
      baseUrl = safeUrl.split('/api/citas')[0] + '/api/citas';
    }

    const url = `${baseUrl}?doctorId=${doctorId}`;
    
    console.log('🚀 [API] Petición de Citas para Doctor:', doctorId);
    console.log('🔗 URL Final:', url);

    return this.http.get<Cita[]>(url).pipe(
      tap(response => {
        console.log('✅ [API] Citas recuperadas:', response?.length || 0);
      })
    );
  }
}
