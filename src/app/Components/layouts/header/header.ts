import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { AlertasService } from '../../../services/alertas.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ButtonModule, BadgeModule, AvatarModule, MenuModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @Input() mostrarToggle = true;
  
  private alertasService = inject(AlertasService);
  
  readonly alertasSinLeer = this.alertasService.sinLeer;
}