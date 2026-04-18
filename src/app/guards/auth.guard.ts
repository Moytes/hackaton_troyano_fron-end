import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermisosService } from '../services/permisos.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const permisosService = inject(PermisosService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const ruta = state.url;
  if (!permisosService.puedeAccederRuta(ruta)) {
    const rol = authService.getRol();
    const rutaRedireccion = rol === 'doctor' ? '/citas' : '/dashboard';
    router.navigate([rutaRedireccion]);
    return false;
  }

  return true;
};

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const rol = authService.getRol();
    const rutaRedireccion = rol === 'doctor' ? '/citas' : '/dashboard';
    router.navigate([rutaRedireccion]);
    return false;
  }

  return true;
};