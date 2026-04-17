import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './Components/layouts/header/header';
import { SidebarComponent } from './Components/layouts/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'TeleAsistencia Sierra';
  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);
  esLanding = signal(true);
  
  private router = inject(Router);
  
  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.esLanding.set(url === '/' || url === '');
    });
  }
  
  toggleSidebar(): void {
    this.mobileMenuOpen.update(v => !v);
  }
  
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
  
  toggleSidebarDesktop(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}