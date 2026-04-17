import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-ayuda',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './ayuda.html',
  styleUrl: './ayuda.css'
})
export class AyudaComponent {
  mensajeEnviado = signal(false);
  estado = signal<'conectado' | 'desconectado' | 'enviando'>('conectado');
  
  enviarEmergencia(): void {
    this.estado.set('enviando');
    
    setTimeout(() => {
      this.mensajeEnviado.set(true);
      this.estado.set('conectado');
    }, 2000);
  }
}