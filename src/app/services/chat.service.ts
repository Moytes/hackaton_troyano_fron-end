import { Injectable, signal } from '@angular/core';
import { Mensaje, TipoRemitente } from '../models/mensaje.model';
import { MENSAJES_MOCK } from '../data/mock-data';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private mensajes = signal<Mensaje[]>(MENSAJES_MOCK);
  private llamadaActivaId = signal<string | null>(null);
  
  readonly mensajesList = this.mensajes.asReadonly();
  
  getMensajesPorLlamada(llamadaId: string): Mensaje[] {
    return this.mensajes()
      .filter(m => m.llamadaId === llamadaId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  setLlamadaActiva(llamadaId: string): void {
    this.llamadaActivaId.set(llamadaId);
  }
  
  getLlamadaActiva(): string | null {
    return this.llamadaActivaId();
  }
  
  agregarMensaje(llamadaId: string, contenido: string, remitente: TipoRemitente): void {
    const mensaje: Mensaje = {
      id: `m${Date.now()}`,
      llamadaId,
      remitente,
      contenido,
      timestamp: new Date()
    };
    this.mensajes.update(list => [...list, mensaje]);
  }
  
  private generarRespuestaIA(prompt: string): string {
    const respuestas = [
      'Entiendo. ¿Podría darme más detalles sobre cómo se siente?',
      'Gracias por la información. ¿Desde cuándo presenta estos síntomas?',
      '¿Ha tomado algún medicamento para aliviar el dolor?',
      '¿Tiene antecedentes de enfermedades como diabetes o presión alta?',
      '¿Puede describirme el dolor? ¿Es punzante, opresivo o palpitante?',
      '¿Presenta otros síntomas como fiebre, mareo o náuseas?'
    ];
    return respuestas[Math.floor(Math.random() * respuestas.length)];
  }
  
  simularRespuestaIA(llamadaId: string): void {
    setTimeout(() => {
      const respuesta = this.generarRespuestaIA('prompt');
      this.agregarMensaje(llamadaId, respuesta, 'ia');
    }, 1500);
  }
}