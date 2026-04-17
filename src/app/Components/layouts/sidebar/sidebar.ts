import { Component, Input, Output, EventEmitter, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { AuthService } from '../../../services/auth.service';

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
  imports: [CommonModule, ButtonModule, BadgeModule, RouterLink, RouterLinkActive, TooltipModule, DialogModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Input() mobileOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() toggleCollapse = new EventEmitter<void>();
  
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentDate = signal('');
  showLogoutDialog = signal(false);
  
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-th-large', route: '/dashboard' },
    { label: 'Llamadas', icon: 'pi pi-phone', route: '/llamadas', badge: 5, severity: 'danger' },
    { label: 'Chat IA', icon: 'pi pi-comments', route: '/chat' },
    { label: 'Citas', icon: 'pi pi-calendar', route: '/citas' },
    { label: 'Agentes', icon: 'pi pi-users', route: '/agentes' },
    { label: 'Alertas', icon: 'pi pi-bell', route: '/alertas', badge: 3, severity: 'warn' },
    { label: 'Ayuda Mioty', icon: 'pi pi-exclamation-triangle', route: '/ayuda' }
  ];
  
  ngOnInit(): void {
    this.updateDate();
  }
  
  getCurrentDate(): string {
    return this.currentDate();
  }
  
  getTooltip(item: MenuItem): string {
    return item.label;
  }
  
  private updateDate(): void {
    const now = new Date();
    this.currentDate.set(now.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short'
    }));
  }
  
  logout(): void {
    this.showLogoutDialog.set(true);
  }
  
  confirmLogout(): void {
    this.showLogoutDialog.set(false);
    this.authService.logout();
  }
  
  cancelLogout(): void {
    this.showLogoutDialog.set(false);
  }
}