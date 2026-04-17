export type Clasificacion = 'grave' | 'moderado' | 'leve' | 'normal';
export type NivelTriage = 1 | 2 | 3 | 4 | 5;
export type EstadoLlamada = 'entrante' | 'en_proceso' | 'escalada' | 'resuelta' | 'cancelada';
export type TipoLlamada = 'emergencia' | 'consulta' | 'seguimiento' | 'recordatorio';

export interface Llamada {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  
  clasificacion: Clasificacion;
  nivelTriage: NivelTriage;
  
  estado: EstadoLlamada;
  tipo: TipoLlamada;
  
  sintomasIniciales: string[];
  descripcion: string;
  duracion?: number;
  
  resumenIA?: string;
  recomendacionesIA?: string[];
  
  horaInicio: Date;
  horaFin?: Date;
  horaEscalada?: Date;
  
  agenteId?: string;
  agenteEspecializado?: string;
}

export interface FiltroLlamadas {
  clasificacion?: Clasificacion;
  estado?: EstadoLlamada;
  tipo?: TipoLlamada;
  fechaInicio?: Date;
  fechaFin?: Date;
  search?: string;
}