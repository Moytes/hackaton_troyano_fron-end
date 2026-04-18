import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  private apiUrl = 'https://hackaton-ms-citas-production.up.railway.app/api/citas';

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
    return this.http.get<Cita[]>(`${this.apiUrl}?doctorId=${doctorId}`);
  }
}
