import { Component, inject, signal, computed, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { ChatService } from '../../services/chat.service';
import { Mensaje } from '../../models/mensaje.model';
import { LLAMADAS_MOCK } from '../../data/mock-data';

@Component({
  selector: 'app-chat-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, AvatarModule, ChipModule],
  templateUrl: './chat-ia.html',
  styleUrl: './chat-ia.css'
})
export class ChatIAComponent implements AfterViewChecked {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  
  private chatService = inject(ChatService);
  
  mensajeActual = signal('');
  seleccionadaLlamadaId = signal<string>(LLAMADAS_MOCK[0].id);
  escribiendo = signal(false);
  
  readonly mensajes = computed(() => this.chatService.getMensajesPorLlamada(this.seleccionadaLlamadaId()));
  
  readonly llamadas = () => LLAMADAS_MOCK;
  
  readonly llamadaActual = computed(() => 
    LLAMADAS_MOCK.find(l => l.id === this.seleccionadaLlamadaId())
  );
  
  readonly sugerencias = [
    'Tengo dolor',
    'Me falta el aire',
    'Tengo fiebre',
    'Me mareo',
    'Tengo tos',
    'Otro síntoma'
  ];
  
  private shouldScroll = false;
  
  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.chatContainer) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }
  
  selectLlamada(id: string): void {
    this.seleccionadaLlamadaId.set(id);
    this.shouldScroll = true;
  }
  
  enviarMensaje(): void {
    const texto = this.mensajeActual().trim();
    if (!texto) return;
    
    this.chatService.agregarMensaje(this.seleccionadaLlamadaId(), texto, 'paciente');
    this.shouldScroll = true;
    
    this.escribiendo.set(true);
    this.chatService.simularRespuestaIA(this.seleccionadaLlamadaId());
    
    setTimeout(() => this.escribiendo.set(false), 1500);
    this.mensajeActual.set('');
  }
  
  usarSugerencia(sugerencia: string): void {
    this.mensajeActual.set(sugerencia);
    this.enviarMensaje();
  }
  
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }
  
  private scrollToBottom(): void {
    try {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch {}
  }
  
  formatHora(date: Date): string {
    return new Date(date).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}