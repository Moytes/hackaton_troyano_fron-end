import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  severity?: 'danger' | 'warn' | 'success' | 'info' | 'secondary';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, ButtonModule, BadgeModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() closeSidebar = new EventEmitter<void>();
  
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-th-large', route: '/dashboard' },
    { label: 'Llamadas', icon: 'pi pi-phone', route: '/llamadas', badge: 5, severity: 'danger' },
    { label: 'Chat IA', icon: 'pi pi-comments', route: '/chat' },
    { label: 'Citas', icon: 'pi pi-calendar', route: '/citas' },
    { label: 'Agentes', icon: 'pi pi-users', route: '/agentes' },
    { label: 'Alertas', icon: 'pi pi-bell', route: '/alertas', badge: 3, severity: 'warn' as const },
    { label: 'Ayuda Mioty', icon: 'pi pi-exclamation-triangle', route: '/ayuda' }
  ];
}