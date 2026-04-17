import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./Pages/landing/landing').then(m => m.LandingComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./Pages/login/login').then(m => m.LoginComponent)
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./Pages/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  { 
    path: 'llamadas', 
    loadComponent: () => import('./Pages/llamadas/llamadas').then(m => m.LlamadasComponent)
  },
  { 
    path: 'llamada/:id', 
    loadComponent: () => import('./Pages/llamada-detalle/llamada-detalle').then(m => m.LlamadaDetalleComponent)
  },
  { 
    path: 'chat', 
    loadComponent: () => import('./Pages/chat-ia/chat-ia').then(m => m.ChatIAComponent)
  },
  { 
    path: 'citas', 
    loadComponent: () => import('./Pages/citas/citas').then(m => m.CitasComponent)
  },
  { 
    path: 'agentes', 
    loadComponent: () => import('./Pages/agentes/agentes').then(m => m.AgentesComponent)
  },
  { 
    path: 'alertas', 
    loadComponent: () => import('./Pages/alertas/alertas').then(m => m.AlertasComponent)
  },
  { 
    path: 'ayuda', 
    loadComponent: () => import('./Pages/ayuda/ayuda').then(m => m.AyudaComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];