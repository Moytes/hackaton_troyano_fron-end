import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { LlamadasService } from '../../services/llamadas.service';
import { CitasService } from '../../services/citas.service';
import { AlertasService } from '../../services/alertas.service';
import { AuthService } from '../../services/auth.service';

interface DashboardStats {
  total: number;
  hoy: number;
  citasHoy: number;
  alertasSinLeer: number;
  pendientes?: number;
  confirmadas?: number;
  completadas?: number;
  graves?: number;
  moderados?: number;
  leves?: number;
  emergencias?: number;
  enProceso?: number;
  resueltas?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule, TimelineModule, CardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  private llamadasService = inject(LlamadasService);
  private citasService = inject(CitasService);
  private alertasService = inject(AlertasService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.cargarDatos();
  }

  private async cargarDatos() {
    const rol = this.authService.getRol();
    if (rol === 'admin' || rol === 'superadmin') {
      await this.llamadasService.cargarLlamadasDelBackend();
    }
  }
  
  readonly rol = computed(() => this.authService.getRol());
  
  readonly puedeVerLlamadas = computed(() => this.rol() === 'superadmin' || this.rol() === 'admin');
  readonly puedeVerCitas = computed(() => this.rol() === 'superadmin' || this.rol() === 'doctor');
  readonly puedeVerAlertas = computed(() => this.rol() === 'superadmin');
  
  readonly statsLlamadas = computed((): DashboardStats => {
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
      citasHoy: 0,
      alertasSinLeer: 0
    };
  });
  
  readonly statsCitas = computed((): DashboardStats => {
    const lista = this.citasService.citasList();
    const hoy = new Date();
    const hoyStr = hoy.toDateString();
    
    return {
      total: lista.length,
      hoy: lista.filter(c => new Date(c.fecha).toDateString() === hoyStr).length,
      pendientes: lista.filter(c => c.estado === 'agendada').length,
      confirmadas: lista.filter(c => c.estado === 'confirmada').length,
      completadas: lista.filter(c => c.estado === 'completada').length,
      citasHoy: 0,
      alertasSinLeer: 0
    };
  });
  
  readonly stats = computed((): DashboardStats => {
    const citasHoy = this.statsCitas().hoy;
    const alertasSinLeer = this.alertasService.sinLeer().length;
    
    if (this.rol() === 'doctor') {
      const citas = this.statsCitas();
      return {
        total: citas.total,
        hoy: citas.hoy,
        citasHoy,
        alertasSinLeer,
        pendientes: citas.pendientes,
        confirmadas: citas.confirmadas,
        completadas: citas.completadas
      };
    }
    
    const llamadas = this.statsLlamadas();
    return {
      total: llamadas.total,
      hoy: llamadas.hoy,
      citasHoy,
      alertasSinLeer,
      graves: llamadas.graves,
      moderados: llamadas.moderados,
      leves: llamadas.leves,
      emergencias: llamadas.emergencias,
      enProceso: llamadas.enProceso,
      resueltas: llamadas.resueltas
    };
  });
  
  readonly ultimasLlamadas = computed(() => {
    return this.llamadasService.llamadasList()
      .sort((a, b) => new Date(b.horaInicio).getTime() - new Date(a.horaInicio).getTime())
      .slice(0, 5);
  });
  
  readonly ultimasCitas = computed(() => {
    return this.citasService.citasList()
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
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