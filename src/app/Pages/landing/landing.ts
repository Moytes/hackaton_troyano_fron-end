import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule, AvatarModule, DividerModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent {
  caracteristicas = [
    { icon: 'pi pi-clock', label: 'IA disponible 24/7', descripcion: 'Asistente médico disponible siempre' },
    { icon: 'pi pi-exclamation-triangle', label: 'Clasificación por gravedad', descripcion: 'Grave, Moderado, Leve o Normal' },
    { icon: 'pi pi-user', label: 'Historial de pacientes', descripcion: 'Guarda enfermedades, medicamentos, alergias' },
    { icon: 'pi pi-users', label: 'Agentes especializados', descripcion: 'Nutriólogo, Pediatra, Cardiólogo' },
    { icon: 'pi pi-calendar', label: 'Citas con doctores', descripcion: 'Agenda directa con profesionales' },
    { icon: 'pi pi-bell', label: 'Botón de emergencia', descripcion: 'Alertas sin internet (Mioty)' }
  ];

  pasos = [
    { numero: 1, titulo: 'Contacto', descripcion: 'El paciente llama o escribe por WhatsApp', icono: '📱' },
    { numero: 2, titulo: 'Análisis IA', descripcion: 'El asistente analiza los síntomas reportados', icono: '🤖' },
    { numero: 3, titulo: 'Clasificación', descripcion: 'Se determina el nivel de urgencia médica', icono: '⚠️' },
    { numero: 4, titulo: 'Atención', descripcion: 'Cita agendada o derivación a emergencia', icono: '🏥' }
  ];
}