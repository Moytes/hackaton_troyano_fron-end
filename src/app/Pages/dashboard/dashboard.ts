import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { PanelModule } from 'primeng/panel';
import { TimelineModule } from 'primeng/timeline';
import { LlamadasService } from '../../services/llamadas.service';
import { PacientesService } from '../../services/pacientes.service';
import { Llamada } from '../../models/llamada.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    CardModule, 
    ButtonModule, 
    TagModule, 
    InputTextModule, 
    AvatarModule, 
    BadgeModule, 
    PanelModule,
    TimelineModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  private llamadasService = inject(LlamadasService);
  private pacientesService = inject(PacientesService);
  
  searchQuery = signal('');
  llamadaSeleccionada = signal<Llamada | null>(null);
  filtroGravedad = signal<string>('todas');
  
  readonly llamadas = this.llamadasService.llamadasFiltradas;
  readonly graves = this.llamadasService.graves;
  readonly moderados = this.llamadasService.moderados;
  readonly leves = this.llamadasService.leves;
  readonly totales = computed(() => this.llamadasService.llamadasList().length);
  
  readonly pacienteActual = computed(() => {
    const ll = this.llamadaSeleccionada();
    if (!ll) return null;
    return this.pacientesService.getPaciente(ll.pacienteId);
  });
  
  readonly historialLlamadas = computed(() => {
    const p = this.pacienteActual();
    if (!p) return [];
    return this.llamadasService.getLlamadasPorPaciente(p.id).slice(0, 5);
  });
  
  selectLlamada(llamada: Llamada): void {
    this.llamadaSeleccionada.set(llamada);
  }
  
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.llamadasService.setFiltro({ search: value });
  }
  
  filtrarPorGravedad(gravedad: string): void {
    this.filtroGravedad.set(gravedad);
    if (gravedad === 'todas') {
      this.llamadasService.clearFiltro();
    } else {
      this.llamadasService.setFiltro({ clasificacion: gravedad as any });
    }
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
  
  getLabelGravedad(gravedad: string): string {
    const map: Record<string, string> = {
      'grave': 'EMERGENCIA',
      'moderado': 'MODERADO',
      'leve': 'LEVE',
      'normal': 'NORMAL'
    };
    return map[gravedad] || gravedad.toUpperCase();
  }
  
  formatHora(date: Date): string {
    return new Date(date).toLocaleTimeString('es-MX', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  formatFecha(date: Date): string {
    return new Date(date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short'
    });
  }
}