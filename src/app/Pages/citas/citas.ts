import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { CitasService } from '../../services/citas.service';
import { FechaService } from '../../services/fecha.service';
import { Cita, Doctor } from '../../models/cita.model';
import { DOCTORES_MOCK, CITAS_MOCK } from '../../data/mock-data';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, TagModule, AvatarModule, DialogModule, SelectModule],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})
export class CitasComponent {
  private citasService = inject(CitasService);
  protected fechaService = inject(FechaService);
  
  showAgendar = signal(false);
  selectedDoctor = signal<Doctor | null>(null);
  selectedFecha = signal<Date | null>(null);
  selectedHora = signal<string>('');
  
  readonly doctores = DOCTORES_MOCK;
  readonly citas = this.citasService.citasList;
  readonly proximas = this.citasService.proximasCitas;
  readonly pendientes = this.citasService.citasPendientes;
  
  readonly opcionesDoctores = this.doctores.map(d => ({
    label: d.nombre,
    value: d
  }));
  
  readonly opcionesFechas = [
    { label: 'Hoy', value: new Date() },
    { label: 'Mañana', value: new Date(Date.now() + 86400000) },
    { label: 'Próxima semana', value: new Date(Date.now() + 7 * 86400000) }
  ];
  
  readonly opcionesHoras = [
    '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'
  ];
  
  openAgendar(): void {
    this.showAgendar.set(true);
  }
  
  closeAgendar(): void {
    this.showAgendar.set(false);
    this.selectedDoctor.set(null);
    this.selectedFecha.set(null);
    this.selectedHora.set('');
  }
  
  agendar(): void {
    if (!this.selectedDoctor() || !this.selectedFecha() || !this.selectedHora()) return;
    
    const cita: Omit<Cita, 'id' | 'recordatorioEnviado'> = {
      pacienteId: 'p1',
      pacienteNombre: 'Juan Pérez García',
      doctorId: this.selectedDoctor()!.id,
      doctorNombre: this.selectedDoctor()!.nombre,
      especialidad: this.selectedDoctor()!.especialidad,
      fecha: new Date(this.selectedFecha()!.toISOString().split('T')[0] + 'T' + this.selectedHora()),
      duracion: 30,
      estado: 'agendada'
    };
    
    this.citasService.agendarCita(cita);
    this.closeAgendar();
  }
  
  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      'agendada': 'warn',
      'confirmada': 'info',
      'completada': 'success',
      'cancelada': 'danger'
    };
    return map[estado] || 'info';
  }
  
  formatFecha(date: Date): string {
    const formatter = new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    return formatter.format(date);
  }

  formatHora(date: Date): string {
    return this.fechaService.formatHora(date);
  }
}