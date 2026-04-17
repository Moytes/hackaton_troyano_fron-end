import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { LlamadasService } from '../../services/llamadas.service';
import { PacientesService } from '../../services/pacientes.service';

@Component({
  selector: 'app-llamada-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, PanelModule, AvatarModule],
  templateUrl: './llamada-detalle.html',
  styleUrl: './llamada-detalle.css'
})
export class LlamadaDetalleComponent {
  private route = inject(ActivatedRoute);
  private llamadasService = inject(LlamadasService);
  private pacientesService = inject(PacientesService);
  
  readonly llamada = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.llamadasService.getLlamada(id) : null;
  });
  
  readonly paciente = computed(() => {
    const ll = this.llamada();
    return ll ? this.pacientesService.getPaciente(ll.pacienteId) : null;
  });
  
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
  
  formatHora(date: Date): string {
    return new Date(date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
  
  formatFecha(date: Date): string {
    return new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }
}