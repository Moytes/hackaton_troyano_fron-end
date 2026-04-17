export type TipoRemitente = 'paciente' | 'ia' | 'sistema';

export interface Mensaje {
  id: string;
  llamadaId: string;
  remitente: TipoRemitente;
  contenido: string;
  timestamp: Date;
  esStreaming?: boolean;
}

export interface MensajeIA {
  esStreaming: boolean;
  contenidoParcial?: string;
}