import { Injectable, signal } from '@angular/core';
import { Paciente } from '../models/paciente.model';
import { PACIENTES_MOCK } from '../data/mock-data';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private pacientes = signal<Paciente[]>(PACIENTES_MOCK);
  
  readonly pacientesList = this.pacientes.asReadonly();
  
  getPaciente(id: string): Paciente | undefined {
    return this.pacientes().find(p => p.id === id);
  }
  
  getPacientes(): Paciente[] {
    return this.pacientes();
  }
  
  searchPacientes(query: string): Paciente[] {
    const q = query.toLowerCase();
    return this.pacientes().filter(p => 
      p.nombre.toLowerCase().includes(q) ||
      p.apellidoPaterno.toLowerCase().includes(q) ||
      p.apellidoMaterno.toLowerCase().includes(q) ||
      p.telefono.includes(q) ||
      p.comunidad.toLowerCase().includes(q)
    );
  }
  
  actualizarPaciente(paciente: Paciente): void {
    this.pacientes.update(list => 
      list.map(p => p.id === paciente.id ? paciente : p)
    );
  }
}