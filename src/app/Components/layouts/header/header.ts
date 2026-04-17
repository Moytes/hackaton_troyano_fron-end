import { Component, inject, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { AlertasService } from '../../../services/alertas.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, BadgeModule, AvatarModule, RouterLink, TooltipModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  @Output() menuToggle = new EventEmitter<void>();
  @Input() mostrarToggle = true;
  
  currentTime = signal('');
  
  private alertasService = inject(AlertasService);
  
  readonly alertasSinLeer = this.alertasService.sinLeer;
  
  ngOnInit(): void {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }
  
  getCurrentTime(): string {
    return this.currentTime();
  }
  
  private updateTime(): void {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    }));
  }
}