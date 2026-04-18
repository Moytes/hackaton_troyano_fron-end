import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { CitasApiService, Cita } from '../../services/citas-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    SkeletonModule,
    InputTextModule
  ],
  templateUrl: './doctor-dashboard.html',
  styleUrl: './doctor-dashboard.css'
})
export class DoctorDashboardComponent implements OnInit {
  private citasService = inject(CitasApiService);
  private authService = inject(AuthService);

  citas = signal<Cita[]>([]);
  loading = signal(true);
  error = signal('');
  filtro = signal('');

  // Estadisticas computed
  totalCitas = computed(() => this.citas().length);
  citasConfirmadas = computed(() =>
    this.citas().filter(c => c.estado === 'confirmada').length
  );
  citasCompletadas = computed(() =>
    this.citas().filter(c => c.estado === 'completada').length
  );
  citasCanceladas = computed(() =>
    this.citas().filter(c => c.estado === 'cancelada').length
  );
  pacientesUnicos = computed(() =>
    new Set(this.citas().map(c => c.pacienteId)).size
  );

  citasFiltradas = computed(() => {
    const filtroText = this.filtro().toLowerCase();
    if (!filtroText) return this.citas();

    return this.citas().filter(cita =>
      cita.pacienteNombre.toLowerCase().includes(filtroText) ||
      cita.pacienteTelefono.toLowerCase().includes(filtroText) ||
      cita.motivo.toLowerCase().includes(filtroText)
    );
  });

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.loading.set(true);
    this.error.set('');

    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (citas) => {
        this.citas.set(citas);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
        this.error.set('Error al cargar las citas. Por favor intenta de nuevo.');
        this.loading.set(false);
      }
    });
  }

  getEstadoClass(estado: string): string {
    const estadoMap: Record<string, string> = {
      'confirmada': 'success',
      'completada': 'info',
      'cancelada': 'danger',
      'pendiente': 'warning'
    };
    return estadoMap[estado] || 'secondary';
  }

  getEstadoLabel(estado: string): string {
    const labelMap: Record<string, string> = {
      'confirmada': 'Confirmada',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'pendiente': 'Pendiente'
    };
    return labelMap[estado] || estado;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  filtrarCitas(event: any): void {
    const texto = (event.target as HTMLInputElement).value;
    this.filtro.set(texto);
  }
}
