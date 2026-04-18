import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal('');
  password = signal('');
  recordarme = signal(false);
  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  onLogin(): void {
    this.error.set('');
    
    if (!this.username().trim()) {
      this.error.set('Ingresa tu usuario');
      return;
    }
    
    if (!this.password()) {
      this.error.set('Ingresa tu contraseña');
      return;
    }

    this.loading.set(true);

    setTimeout(() => {
      const success = this.authService.login(
        { username: this.username(), password: this.password() },
        this.recordarme()
      );

      this.loading.set(false);

      if (!success) {
        this.error.set('Usuario o contraseña incorrectos');
      } else {
        console.log('✅ [LOGIN] Redirigiendo a selección de usuario');
        this.router.navigate(['/usuario-selector']);
      }
    }, 800);
  }
}