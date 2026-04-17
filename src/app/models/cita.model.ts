export type EstadoCita = 'agendada' | 'confirmada' | 'completada' | 'cancelada' | 'no_show';

export interface Cita {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  doctorId: string;
  doctorNombre: string;
  especialidad: string;
  
  fecha: Date;
  duracion: number;
  
  estado: EstadoCita;
  
  notas?: string;
  recordatorioEnviado: boolean;
}

export interface Doctor {
  id: string;
  nombre: string;
  especialidad: string;
  cedula: string;
  telefono: string;
  email: string;
  disponibilidad: Disponibilidad[];
  fotoUrl?: string;
}

export interface Disponibilidad {
  dia: number;
  horaInicio: string;
  horaFin: string;
}