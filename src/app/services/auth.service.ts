import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario, Credenciales, Rol } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioActual = signal<Usuario | null>(null);
  private Remember = signal(false);

  private readonly usuariosEstaticos: Usuario[] = [
    {
      id: 'u1',
      username: 'admin',
      nombre: 'María',
      apellidoPaterno: 'López',
      apellidoMaterno: 'Fernández',
      email: 'admin@salud.siglo.gob.mx',
      especialidad: 'Administración',
      rol: 'admin',
      fotoUrl: '',
      fechaRegistro: new Date('2024-01-01'),
      ultimoAcceso: new Date(),
      activo: true
    },
    {
      id: 'u2',
      username: 'doctor',
      nombre: 'Carlos',
      apellidoPaterno: 'García',
      apellidoMaterno: 'Rodríguez',
      email: 'doctor@salud.siglo.gob.mx',
      especialidad: 'Medicina General',
      rol: 'doctor',
      fotoUrl: '',
      fechaRegistro: new Date('2024-01-05'),
      ultimoAcceso: new Date(),
      activo: true
    },
    {
      id: 'u3',
      username: 'superadmin',
      nombre: 'Supervisor',
      apellidoPaterno: 'Sistema',
      apellidoMaterno: 'Admin',
      email: 'superadmin@salud.siglo.gob.mx',
      especialidad: 'Administración Sistema',
      rol: 'superadmin',
      fotoUrl: '',
      fechaRegistro: new Date('2023-12-01'),
      ultimoAcceso: new Date(),
      activo: true
    }
  ];

  private readonly passwords: Record<string, string> = {
    'admin': 'admin2024',
    'admin@salud.siglo.gob.mx': 'admin2024',
    'doctor': 'doctor',
    'doctor@salud.siglo.gob.mx': 'doctor',
    'superadmin': 'super',
    'superadmin@salud.siglo.gob.mx': 'super'
  };

  readonly usuario = computed(() => this.usuarioActual());
  readonly isLoggedIn = computed(() => this.usuarioActual() !== null);

  constructor(private router: Router) {
    this.cargarSesion();
  }

  login(credenciales: Credenciales, recordarme: boolean = false): boolean {
    const username = credenciales.username.trim().toLowerCase();
    const password = credenciales.password;

    const esEmail = username.includes('@');

    const usuario = this.usuariosEstaticos.find(u =>
      (!esEmail && u.username.toLowerCase() === username) ||
      (esEmail && u.email.toLowerCase() === username)
    );

    if (usuario && this.passwords[username] === password) {
      this.usuarioActual.set({ ...usuario, ultimoAcceso: new Date() });
      this.Remember.set(recordarme);
      this.guardarSesion();

      const rutaRedireccion = usuario.rol === 'doctor' ? '/citas' : '/dashboard';
      this.router.navigate([rutaRedireccion]);
      return true;
    }

    return false;
  }

  logout(): void {
    this.usuarioActual.set(null);
    this.Remember.set(false);
    localStorage.removeItem('teleasistencia_user');
    this.router.navigate(['/login']);
  }

  private cargarSesion(): void {
    const sesion = localStorage.getItem('teleasistencia_user');
    if (sesion) {
      try {
        const data = JSON.parse(sesion);
        if (data && data.usuario) {
          this.usuarioActual.set(data.usuario);
          this.Remember.set(true);
        }
      } catch {
        localStorage.removeItem('teleasistencia_user');
      }
    }
  }

  private guardarSesion(): void {
    const data = {
      usuario: this.usuarioActual(),
      fecha: new Date().toISOString()
    };
    localStorage.setItem('teleasistencia_user', JSON.stringify(data));
  }

  getNombreCompleto(): string {
    const u = this.usuarioActual();
    if (!u) return '';
    return `${u.nombre} ${u.apellidoPaterno}`;
  }

  getEspecialidad(): string {
    return this.usuarioActual()?.especialidad || '';
  }

  getRol(): Rol | null {
    return this.usuarioActual()?.rol || null;
  }

  esDoctor(): boolean {
    return this.usuarioActual()?.rol === 'doctor';
  }

  esAdmin(): boolean {
    return this.usuarioActual()?.rol === 'admin';
  }

  esSuperAdmin(): boolean {
    return this.usuarioActual()?.rol === 'superadmin';
  }

  getLabelRol(): string {
    const rol = this.getRol();
    const labels: Record<Rol, string> = {
      'doctor': 'Doctor',
      'admin': 'Administrador',
      'superadmin': 'Super Administrador'
    };
    return rol ? labels[rol] : '';
  }
}