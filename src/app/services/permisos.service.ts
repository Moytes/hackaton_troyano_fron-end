import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Rol } from '../models/usuario.model';

export type Permiso = 
  | 'ver_dashboard'
  | 'ver_llamadas'
  | 'ver_citas'
  | 'ver_chat'
  | 'ver_agentes'
  | 'ver_alertas'
  | 'ver_ayuda'
  | 'ver_users';

const PERMISOS_POR_ROL: Record<Rol, Permiso[]> = {
  superadmin: [
    'ver_dashboard',
    'ver_llamadas',
    'ver_citas',
    'ver_chat',
    'ver_agentes',
    'ver_alertas',
    'ver_ayuda',
    'ver_users'
  ],
  admin: [
    'ver_dashboard',
    'ver_llamadas'
  ],
  doctor: [
    'ver_citas'
  ]
};

const RUTAS_PERMISOS: Record<string, Permiso> = {
  '/dashboard': 'ver_dashboard',
  '/llamadas': 'ver_llamadas',
  '/citas': 'ver_citas',
  '/chat': 'ver_chat',
  '/agentes': 'ver_agentes',
  '/alertas': 'ver_alertas',
  '/ayuda': 'ver_ayuda',
  '/users': 'ver_users'
};

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private authService = inject(AuthService);

  tienePermiso(permiso: Permiso): boolean {
    const rol = this.authService.getRol();
    if (!rol) return false;
    return PERMISOS_POR_ROL[rol].includes(permiso);
  }

  puedeAccederRuta(ruta: string): boolean {
    const permiso = RUTAS_PERMISOS[ruta];
    if (!permiso) return true;
    return this.tienePermiso(permiso);
  }

  getRutasPermitidas(): string[] {
    const rol = this.authService.getRol();
    if (!rol) return [];
    
    const permisos = PERMISOS_POR_ROL[rol];
    const rutas: string[] = [];
    
    for (const [ruta, permiso] of Object.entries(RUTAS_PERMISOS)) {
      if (permisos.includes(permiso)) {
        rutas.push(ruta);
      }
    }
    
    return rutas;
  }

  puedeVerLlamadas(): boolean {
    return this.tienePermiso('ver_llamadas');
  }

  puedeVerCitas(): boolean {
    return this.tienePermiso('ver_citas');
  }

  puedeVerAgentes(): boolean {
    return this.tienePermiso('ver_agentes');
  }

  puedeVerAlertas(): boolean {
    return this.tienePermiso('ver_alertas');
  }

  puedeVerUsers(): boolean {
    return this.tienePermiso('ver_users');
  }

  esDoctor(): boolean {
    return this.authService.getRol() === 'doctor';
  }

  esAdmin(): boolean {
    return this.authService.getRol() === 'admin';
  }

  esSuperAdmin(): boolean {
    return this.authService.getRol() === 'superadmin';
  }
}