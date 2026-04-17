import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { LlamadasService } from '../../services/llamadas.service';
import { CitasService } from '../../services/citas.service';
import { AlertasService } from '../../services/alertas.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, TimelineModule, CardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  private llamadasService = inject(LlamadasService);
  private citasService = inject(CitasService);
  private alertasService = inject(AlertasService);
  
  readonly stats = computed(() => {
    const lista = this.llamadasService.llamadasList();
    const hoy = new Date();
    const hoyStr = hoy.toDateString();
    
    const llamadasHoy = lista.filter(l => 
      new Date(l.horaInicio).toDateString() === hoyStr
    );
    
    return {
      total: lista.length,
      hoy: llamadasHoy.length,
      graves: lista.filter(l => l.clasificacion === 'grave').length,
      moderados: lista.filter(l => l.clasificacion === 'moderado').length,
      leves: lista.filter(l => l.clasificacion === 'leve').length,
      emergencias: lista.filter(l => l.clasificacion === 'grave' && l.estado !== 'resuelta').length,
      enProceso: lista.filter(l => l.estado === 'en_proceso').length,
      resueltas: lista.filter(l => l.estado === 'resuelta').length,
      citasHoy: this.citasService.citasList().filter(c => 
        new Date(c.fecha).toDateString() === hoyStr
      ).length,
      alertasSinLeer: this.alertasService.sinLeer().length
    };
  });
  
  readonly ultimasLlamadas = computed(() => {
    return this.llamadasService.llamadasList()
      .sort((a, b) => new Date(b.horaInicio).getTime() - new Date(a.horaInicio).getTime())
      .slice(0, 5);
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
  
  today(): string {
    return new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}