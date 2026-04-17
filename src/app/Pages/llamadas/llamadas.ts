import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { LlamadasService } from '../../services/llamadas.service';

@Component({
  selector: 'app-llamadas',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, InputTextModule],
  templateUrl: './llamadas.html',
  styleUrl: './llamadas.css'
})
export class LlamadasComponent {
  private llamadasService = inject(LlamadasService);
  
  readonly llamadas = this.llamadasService.llamadasFiltradas;
  readonly graves = this.llamadasService.graves;
  readonly moderados = this.llamadasService.moderados;
  readonly leves = this.llamadasService.leves;
  
  filtrar(gravedad: string): void {
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
}