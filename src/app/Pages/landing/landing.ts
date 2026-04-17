import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
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
export class LandingComponent implements OnInit, AfterViewInit {
  private scrolled = false;

  caracteristicas = [
    { icon: 'pi pi-clock', label: 'IA disponible 24/7', descripcion: 'Asistente médico disponible siempre' },
    { icon: 'pi pi-exclamation-triangle', label: 'Clasificación por gravedad', descripcion: 'Grave, Moderado, Leve o Normal' },
    { icon: 'pi pi-user', label: 'Historial de pacientes', descripcion: 'Guarda enfermedades, medicamentos, alergias' },
    { icon: 'pi pi-users', label: 'Agentes especializados', descripcion: 'Nutriólogo, Pediatra, Cardiólogo' },
    { icon: 'pi pi-calendar', label: 'Citas con doctores', descripcion: 'Agenda directa con profesionales' },
    { icon: 'pi pi-bell', label: 'Botón de emergencia', descripcion: 'Alertas sin internet (Mioty)' }
  ];

  pasos = [
    { numero: 1, titulo: 'Contacto', descripcion: 'El paciente llama o escribe por WhatsApp', icon: 'pi pi-phone' },
    { numero: 2, titulo: 'Análisis IA', descripcion: 'El asistente analiza los síntomas reportados', icon: 'pi pi-microchip' },
    { numero: 3, titulo: 'Clasificación', descripcion: 'Se determina el nivel de urgencia médica', icon: 'pi pi-chart-bar' },
    { numero: 4, titulo: 'Atención', descripcion: 'Cita agendada o derivación a emergencia', icon: 'pi pi-heart' }
  ];

  featureCards = [
    { icon: 'pi pi-users', title: 'Accesible para todos', description: 'WhatsApp es la forma más fácil de acceder a atención médica en la Sierra' },
    { icon: 'pi pi-map-marker', title: 'Llega a todas partes', description: 'La tecnología lleva la salud a comunidades alejadas' },
    { icon: 'pi pi-clock', title: 'atención inmediata', description: 'La IA responde al instante, sin importar la hora' }
  ];

  nivelesTriage = [
    { nivel: 'Grave', descripcion: 'Requiere atención inmediata', tiempo: '< 15 min', icon: 'pi pi-exclamation-circle' },
    { nivel: 'Moderado', descripcion: 'Atención prioritaria', tiempo: '< 1 hora', icon: 'pi pi-exclamation-triangle' },
    { nivel: 'Leve', descripcion: 'Consulta programada', tiempo: '< 4 horas', icon: 'pi pi-info-circle' },
    { nivel: 'Normal', descripcion: 'Consulta general', tiempo: '< 24 horas', icon: 'pi pi-check-circle' }
  ];

  publicoObjetivo = [
    { icon: 'pi pi-user', nombre: 'Adultos mayores', descripcion: 'Personas de 60+ años en comunidades de la Sierra' },
    { icon: 'pi pi-home', nombre: 'Familiares', descripcion: 'Cuidadores y familiares que buscan atención' },
    { icon: 'pi pi-briefcase', nombre: 'Personal de salud', descripcion: 'Enfermeros y doctores en comunidades rurales' }
  ];

  ngOnInit(): void {
    // Parallax initialization is structurally safe here.
  }

  ngAfterViewInit(): void {
    // We initialize animations here to guarantee DOM `@for` loops have rendered elements.
    // Timeout helps guarantee child component paints are complete.
    setTimeout(() => {
      this.initAnimations();
      this.initParallax();
    }, 100);
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    this.scrolled = window.scrollY > 50;
    this.updateParallax();
  }

  private initAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const delay = parseInt(element.getAttribute('data-delay') || '0', 10);
          
          setTimeout(() => {
            element.classList.add('animate-in');
          }, delay);
          
          observer.unobserve(element);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
  }

  private initParallax(): void {
    document.querySelectorAll('.parallax-layer').forEach(layer => {
      const speed = parseFloat(layer.getAttribute('data-speed') || '0.5');
      (layer as HTMLElement).style.setProperty('--parallax-speed', speed.toString());
    });
  }

  private updateParallax(): void {
    const scrollY = window.scrollY;
    document.querySelectorAll('.parallax-layer').forEach(layer => {
      const speed = parseFloat((layer as HTMLElement).style.getPropertyValue('--parallax-speed') || '0.5');
      const yPos = scrollY * speed;
      (layer as HTMLElement).style.transform = `translateY(${yPos}px)`;
    });
  }
}