import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AGENTES_MOCK } from '../../data/mock-data';
import { Agente } from '../../models/alerta.model';

@Component({
  selector: 'app-agentes',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  templateUrl: './agentes.html',
  styleUrl: './agentes.css'
})
export class AgentesComponent {
  readonly agentes = AGENTES_MOCK;
  
  activarAgente(agente: Agente): void {
    console.log('Activar agente:', agente.nombre);
  }
  
  getIcon(icono: string): string {
    const map: Record<string, string> = {
      'pi pi-user': '👤',
      'pi pi-apple': '🍎',
      'pi pi-heart': '❤️',
      'pi pi-bolt': '⚡',
      'pi pi-users': '👥'
    };
    return map[icono] || '🤖';
  }
}