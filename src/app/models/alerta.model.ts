export type TipoAlerta = 'emergencia' | 'recordatorio' | 'sintomas' | 'cita' | 'sistema';
export type PrioridadAlerta = 'alta' | 'media' | 'baja';

export interface Alerta {
  id: string;
  tipo: TipoAlerta;
  prioridad: PrioridadAlerta;
  
  titulo: string;
  mensaje: string;
  
  pacienteId?: string;
  pacienteNombre?: string;
  
  relacionadaId?: string;
  relacionadaTipo?: 'llamada' | 'cita' | 'paciente';
  
  leida: boolean;
  fechaCreacion: Date;
  fechaLectura?: Date;
}

export type AgenteTipo = 'general' | 'nutriologo' | 'pediatra' | 'cardiologo' | 'geriatra';

export interface Agente {
  id: string;
  tipo: AgenteTipo;
  nombre: string;
  descripcion: string;
  especialdad: string;
  activo: boolean;
  icono: string;
}