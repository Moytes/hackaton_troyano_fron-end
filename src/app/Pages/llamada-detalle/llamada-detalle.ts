import { Component, inject, signal, computed, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { LlamadasService } from '../../services/llamadas.service';
import { LlamadasStreamService } from '../../services/llamadas-stream.service';
import { PacientesService } from '../../services/pacientes.service';
import { FechaService } from '../../services/fecha.service';
import { Transcription } from '../../models/llamada.model';

@Component({
  selector: 'app-llamada-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, PanelModule, AvatarModule, ScrollPanelModule],
  templateUrl: './llamada-detalle.html',
  styleUrl: './llamada-detalle.css'
})
export class LlamadaDetalleComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('conversationScroll') conversationScroll!: ElementRef;

  private route = inject(ActivatedRoute);
  private llamadasService = inject(LlamadasService);
  private pacientesService = inject(PacientesService);
  private streamService = inject(LlamadasStreamService);
  protected fechaService = inject(FechaService);

  private shouldScroll = false;
  
  readonly llamada = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.llamadasService.getLlamada(id) : null;
  });
  
  readonly paciente = computed(() => {
    const ll = this.llamada();
    return ll ? this.pacientesService.getPaciente(ll.pacienteId) : null;
  });

  readonly transcriptions = computed(() => {
    const ll = this.llamada();
    return ll?.transcriptions || [];
  });

  streamConnected = this.streamService.isStreamConnected;

  ngOnInit(): void {
    console.log('🎯 [DETALLE] Inicializando componente de detalle...');
    const llamadaId = this.route.snapshot.paramMap.get('id');
    if (llamadaId) {
      this.iniciarStreamConversacion(llamadaId);
    }
  }

  ngOnDestroy(): void {
    console.log('🛑 [DETALLE] Destruyendo componente, desconectando stream...');
    this.streamService.disconnectStream();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.conversationScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private iniciarStreamConversacion(llamadaId: string): void {
    console.log('📡 [DETALLE] Conectando stream para conversación de llamada:', llamadaId);

    this.streamService.connectStream(
      (nuevaLlamada) => {
        console.log('🔔 [DETALLE] Nueva llamada desde stream:', nuevaLlamada);
        if (nuevaLlamada.id === llamadaId) {
          this.llamadasService.agregarOActualizar(nuevaLlamada);
          this.shouldScroll = true;
        }
      },
      (llamadaActualizada) => {
        console.log('🔄 [DETALLE] Llamada actualizada desde stream:', llamadaActualizada);
        if (llamadaActualizada.id === llamadaId) {
          this.llamadasService.agregarOActualizar(llamadaActualizada);
          this.shouldScroll = true;
        }
      },
      (status) => {
        console.log('📊 [DETALLE] Estado del stream:', status);
      }
    );
  }

  private scrollToBottom(): void {
    try {
      const el = this.conversationScroll.nativeElement;
      el.scrollTop = el.scrollHeight;
      console.log('⬇️  [DETALLE] Scroll al final de conversación');
    } catch (e) {
      console.warn('⚠️  [DETALLE] Error al hacer scroll:', e);
    }
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      'paciente': '👤 Paciente',
      'ia': '🤖 IA Asistente',
      'sistema': '⚙️ Sistema'
    };
    return map[role] || role.toUpperCase();
  }

  formatTimestamp(ts?: string): string {
    if (!ts) return '--:--';
    return this.fechaService.getTimestampDebug(this.fechaService.parseDate(ts));
  }

  getSeverity(gravedad: string): 'danger' | 'warn' | 'success' | 'info' {
    const map: Record<string, 'danger' | 'warn' | 'success' | 'info'> = {
      'grave': 'danger',
      'moderado': 'warn',
      'leve': 'success',
      'normal': 'info'
    };
    return map[gravedad] || 'info';
  }

  getLabel(gravedad: string): string {
    const map: Record<string, string> = {
      'grave': 'EMERGENCIA',
      'moderado': 'MODERADO',
      'leve': 'LEVE',
      'normal': 'NORMAL'
    };
    return map[gravedad] || gravedad.toUpperCase();
  }
}