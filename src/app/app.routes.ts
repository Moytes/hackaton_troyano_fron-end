import { Routes } from '@angular/router';
import { authGuard, loginGuard, landingGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./Pages/landing/landing').then(m => m.LandingComponent),
    canActivate: [landingGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./Pages/login/login').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'usuario-selector',
    loadComponent: () => import('./Pages/usuario-selector/usuario-selector').then(m => m.UsuarioSelectorComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./Pages/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'llamadas', 
    loadComponent: () => import('./Pages/llamadas/llamadas').then(m => m.LlamadasComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'llamada/:id', 
    loadComponent: () => import('./Pages/llamada-detalle/llamada-detalle').then(m => m.LlamadaDetalleComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'chat', 
    loadComponent: () => import('./Pages/chat-ia/chat-ia').then(m => m.ChatIAComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'citas', 
    loadComponent: () => import('./Pages/citas/citas').then(m => m.CitasComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'agentes', 
    loadComponent: () => import('./Pages/agentes/agentes').then(m => m.AgentesComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'alertas', 
    loadComponent: () => import('./Pages/alertas/alertas').then(m => m.AlertasComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ayuda',
    loadComponent: () => import('./Pages/ayuda/ayuda').then(m => m.AyudaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'doctor-dashboard',
    loadComponent: () => import('./Pages/doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboardComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];