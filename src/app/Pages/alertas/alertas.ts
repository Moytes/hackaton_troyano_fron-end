import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AlertasService } from '../../services/alertas.service';
import { Alerta } from '../../models/alerta.model';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule],
  templateUrl: './alertas.html',
  styleUrl: './alertas.css'
})
export class AlertasComponent {
  private alertasService = inject(AlertasService);
  
  readonly alertas = this.alertasService.alertasList;
  readonly sinLeer = this.alertasService.sinLeer;
  readonly emergencias = this.alertasService.emergencias;
  readonly recordatorios = this.alertasService.recordatorios;
  
  marcarLeida(alerta: Alerta): void {
    this.alertasService.marcarComoLeida(alerta.id);
  }
  
  marcarTodas(): void {
    this.alertasService.marcarTodasComoLeidas();
  }
  
  getPrioridadSeverity(prioridad: string): 'danger' | 'warn' | 'info' {
    const map: Record<string, 'danger' | 'warn' | 'info'> = {
      'alta': 'danger',
      'media': 'warn',
      'baja': 'info'
    };
    return map[prioridad] || 'info';
  }
  
  getTipoIcon(tipo: string): string {
    const map: Record<string, string> = {
      'emergencia': '⚠️',
      'recordatorio': '📅',
      'sintomas': '🩺',
      'cita': '📋',
      'sistema': '🔔'
    };
    return map[tipo] || '📌';
  }
  
  formatFecha(date: Date): string {
    const ahora = new Date();
    const fecha = new Date(date);
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} h`;
    if (dias < 7) return `Hace ${dias} días`;
    return fecha.toLocaleDateString('es-MX');
  }
}