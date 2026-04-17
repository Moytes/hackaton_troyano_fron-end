import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario, Credenciales } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioActual = signal<Usuario | null>(null);
  private Remember = signal(false);

  private readonly usuarioEstatico: Usuario = {
    id: 'u1',
    username: 'dr.garcia',
    nombre: 'Roberto',
    apellidoPaterno: 'García',
    apellidoMaterno: 'Mendoza',
    email: 'dr.garcia@salud.siglo.gob.mx',
    especialidad: 'Medicina General',
    rol: 'medico',
    fotoUrl: '',
    fechaRegistro: new Date('2024-01-01'),
    ultimoAcceso: new Date(),
    activo: true
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
    
    const credencialesValidas = 
      (!esEmail && username === this.usuarioEstatico.username) ||
      (esEmail && username === this.usuarioEstatico.email.toLowerCase());

    if (credencialesValidas && password === 'tele2024') {
      this.usuarioActual.set({ ...this.usuarioEstatico, ultimoAcceso: new Date() });
      this.Remember.set(recordarme);

      if (recordarme) {
        this.guardarSesion();
      }

      this.router.navigate(['/dashboard']);
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
}