import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuario-selector',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, AvatarModule],
  templateUrl: './usuario-selector.html',
  styleUrl: './usuario-selector.css'
})
export class UsuarioSelectorComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly usuariosEstaticos = [
    {
      id: 'u1',
      username: 'admin',
      nombre: 'María',
      apellido: 'López',
      rol: 'admin',
      especialidad: 'Administración',
      icon: 'pi-users'
    },
    {
      id: 'u2',
      username: 'doctor',
      nombre: 'Dr. Carlos',
      apellido: 'García',
      rol: 'doctor',
      especialidad: 'Medicina General',
      icon: 'pi-user-md'
    },
    {
      id: 'u3',
      username: 'superadmin',
      nombre: 'Supervisor',
      apellido: 'Sistema',
      rol: 'superadmin',
      especialidad: 'Administración Sistema',
      icon: 'pi-shield'
    }
  ];

  seleccionarUsuario(usuario: any): void {
    console.log('👤 [SELECTOR] Seleccionando usuario:', usuario.username);

    const credenciales = {
      username: usuario.username,
      password: usuario.rol === 'admin' ? 'admin2024' : usuario.rol === 'doctor' ? 'doctor' : 'super'
    };

    const success = this.authService.login(credenciales, false);

    if (success) {
      console.log('✅ [SELECTOR] Usuario seleccionado correctamente');
      const rutaRedireccion = usuario.rol === 'doctor' ? '/citas' : '/dashboard';
      this.router.navigate([rutaRedireccion]);
    } else {
      console.error('❌ [SELECTOR] Error al seleccionar usuario');
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
