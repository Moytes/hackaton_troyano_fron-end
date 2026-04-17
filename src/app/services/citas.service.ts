import { Injectable, signal, computed } from '@angular/core';
import { Cita, Doctor } from '../models/cita.model';
import { CITAS_MOCK, DOCTORES_MOCK } from '../data/mock-data';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private citas = signal<Cita[]>(CITAS_MOCK);
  private doctores = signal<Doctor[]>(DOCTORES_MOCK);
  
  readonly citasList = this.citas.asReadonly();
  readonly doctoresList = this.doctores.asReadonly();
  
  readonly proximasCitas = computed(() => {
    const ahora = new Date();
    return this.citas()
      .filter(c => new Date(c.fecha) > ahora && c.estado !== 'cancelada')
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  });
  
  readonly citasPendientes = computed(() => 
    this.citas().filter(c => c.estado === 'agendada')
  );
  
  getCitasPorPaciente(pacienteId: string): Cita[] {
    return this.citas().filter(c => c.pacienteId === pacienteId);
  }
  
  getDoctor(id: string): Doctor | undefined {
    return this.doctores().find(d => d.id === id);
  }
  
  getDoctoresPorEspecialidad(especialidad: string): Doctor[] {
    return this.doctores().filter(d => 
      d.especialidad.toLowerCase().includes(especialidad.toLowerCase())
    );
  }
  
  agendarCita(cita: Omit<Cita, 'id' | 'recordatorioEnviado'>): void {
    const nueva: Cita = {
      ...cita,
      id: `c${Date.now()}`,
      recordatorioEnviado: false
    };
    this.citas.update(list => [...list, nueva]);
  }
  
  actualizarCita(id: string, datos: Partial<Cita>): void {
    this.citas.update(list =>
      list.map(c => c.id === id ? { ...c, ...datos } : c)
    );
  }
  
  cancelarCita(id: string): void {
    this.actualizarCita(id, { estado: 'cancelada' });
  }
}