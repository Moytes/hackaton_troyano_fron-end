import { Component, signal, inject, HostListener } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './Components/layouts/header/header';
import { SidebarComponent } from './Components/layouts/sidebar/sidebar';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'VozRural';
  sidebarCollapsed = signal(false);
  mobileMenuOpen = signal(false);
  esLanding = signal(true);
  esLogin = signal(false);
  isMobile = signal(false);
  isTablet = signal(false);
  
  private router = inject(Router);
  private authService = inject(AuthService);
  
  constructor() {
    this.checkViewport();
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      const esLogin = url === '/login';
      const esLanding = url === '/' || url === '';
      this.esLogin.set(esLogin);
      this.esLanding.set(esLanding);
      
      if (esLogin) {
        this.mobileMenuOpen.set(false);
        if (this.authService.isLoggedIn()) {
          this.router.navigate(['/dashboard']);
          return;
        }
      }
      
      if (!this.authService.isLoggedIn() && !esLogin && !esLanding) {
        this.router.navigate(['/login']);
      }
    });
  }
  
  @HostListener('window:resize')
  onResize() {
    this.checkViewport();
  }
  
  private checkViewport(): void {
    const width = window.innerWidth;
    this.isMobile.set(width <= 768);
    this.isTablet.set(width > 768 && width <= 1024);
  }
  
  esSidebarExpandido(): boolean {
    if (this.isMobile() || this.isTablet()) {
      return this.mobileMenuOpen();
    }
    return !this.sidebarCollapsed();
  }
  
  onMenuToggle(): void {
    this.mobileMenuOpen.update(v => !v);
  }
  
  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
  
  onToggleCollapse(): void {
    if (this.isMobile() || this.isTablet()) {
      this.mobileMenuOpen.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }
}