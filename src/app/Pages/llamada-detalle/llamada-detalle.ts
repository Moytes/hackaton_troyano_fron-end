import { Component, inject, signal, computed, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { LlamadasService } from '../../services/llamadas.service';
import { LlamadasStreamService } from '../../services/llamadas-stream.service';
import { LlamadasHttpService } from '../../services/llamadas-http.service';
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
  private location = inject(Location);
  private llamadasService = inject(LlamadasService);
  private httpService = inject(LlamadasHttpService);
  private pacientesService = inject(PacientesService);
  private streamService = inject(LlamadasStreamService);
  protected fechaService = inject(FechaService);

  usuarioActual = signal<any>(null);
  usuarioDisponible = computed(() => !!this.usuarioActual());
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

    // Intentar obtener usuario del estado de navegación primero (sin petición HTTP)
    const navigationState = this.location.path();
    const usuarioDelEstado = (this.location as any).historyState?.usuario;

    if (usuarioDelEstado) {
      console.log('✅ [DETALLE] Usuario obtenido del estado de navegación (sin HTTP):', usuarioDelEstado.name);
      this.usuarioActual.set(usuarioDelEstado);
    } else if (llamadaId) {
      // Fallback: si no hay usuario en estado, cargar desde API
      const llamada = this.llamadasService.getLlamada(llamadaId);
      if (llamada) {
        console.log('📡 [DETALLE] Usuario NO en estado, cargando desde API...');
        this.cargarUsuarioDesdeAPI(llamada.pacienteId);
      }
    }

    if (llamadaId) {
      this.iniciarStreamConversacion(llamadaId);
    }
  }

  private cargarUsuarioDesdeAPI(pacienteId: string): void {
    console.log('📡 [DETALLE] Cargando datos del usuario desde API:', pacienteId);
    this.httpService.getUserById(pacienteId).subscribe({
      next: (res: any) => {
        console.log('✅ [DETALLE] Usuario cargado desde API:', res.user.name);
        this.usuarioActual.set(res.user);
      },
      error: (err: any) => {
        console.error('❌ [DETALLE] Error cargando usuario desde API:', err);
      }
    });
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

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 3);
  }

  getNombrePaciente(): string {
    return this.usuarioActual()?.name || this.llamada()?.pacienteNombre || 'Paciente';
  }
}