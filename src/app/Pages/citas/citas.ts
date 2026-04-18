import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { CitasApiService, Cita } from '../../services/citas-api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    TableModule,
    SkeletonModule,
    InputTextModule,
    TooltipModule,
    CardModule
  ],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})
export class CitasComponent implements OnInit {
  private citasApiService = inject(CitasApiService);
  private authService = inject(AuthService);

  // Estados
  todasLasCitas = signal<Cita[]>([]);
  citasDoctor = signal<Cita[]>([]);
  citaSeleccionada = signal<Cita | null>(null);

  loading = signal(false);
  error = signal('');
  selectedDoctorId = signal<number>(0);
  citaIdBusqueda = signal<number>(0);
  activeTab = signal<'doctor' | 'todas' | 'detalle'>('doctor');

  // Rol del usuario
  esDoctor = signal(false);

  // Computed para estadísticas del doctor
  citasConfirmadas = computed(() =>
    this.citasDoctor().filter(c => c.estado === 'confirmada').length
  );
  citasCompletadas = computed(() =>
    this.citasDoctor().filter(c => c.estado === 'completada').length
  );
  citasCanceladas = computed(() =>
    this.citasDoctor().filter(c => c.estado === 'cancelada').length
  );
  citasPendientes = computed(() =>
    this.citasDoctor().filter(c => c.estado === 'pendiente').length
  );

  // Pacientes únicos del doctor
  pacientesUnicos = computed(() => {
    const pacientes = new Map<string, { nombre: string; telefono: string; citasCount: number }>();
    this.citasDoctor().forEach(cita => {
      const existe = pacientes.get(cita.pacienteId);
      if (existe) {
        pacientes.set(cita.pacienteId, { ...existe, citasCount: existe.citasCount + 1 });
      } else {
        pacientes.set(cita.pacienteId, {
          nombre: cita.pacienteNombre,
          telefono: cita.pacienteTelefono,
          citasCount: 1
        });
      }
    });
    return Array.from(pacientes.values());
  });

  ngOnInit(): void {
    const esDoc = this.authService.esDoctor();
    this.esDoctor.set(esDoc);

    if (esDoc) {
      const usuario = this.authService.usuario();
      if (usuario) {
        // Extrae solo números del ID (ej: 'u2' -> 2, 'd5' -> 5)
        const id = parseInt(usuario.id.replace(/\D/g, ''), 10);
        this.selectedDoctorId.set(id);
      }
      this.activeTab.set('doctor');
      this.cargarCitasDoctor();
    } else {
      this.cargarTodasLasCitas();
    }
  }

  cargarTodasLasCitas(): void {
    this.loading.set(true);
    this.error.set('');

    this.citasApiService.obtenerTodasLasCitas().subscribe({
      next: (citas) => {
        this.todasLasCitas.set(citas);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar todas las citas');
        this.loading.set(false);
      }
    });
  }

  cargarCitasDoctor(): void {
    const doctorId = this.selectedDoctorId();
    if (!doctorId) return;

    this.loading.set(true);
    this.error.set('');

    this.citasApiService.obtenerCitasPorDoctor(doctorId).subscribe({
      next: (citas) => {
        this.citasDoctor.set(citas);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar citas del doctor');
        this.loading.set(false);
      }
    });
  }

  buscarCitaPorId(): void {
    const citaId = this.citaIdBusqueda();
    if (!citaId) return;

    this.loading.set(true);
    this.error.set('');

    this.citasApiService.obtenerCitaPorId(citaId).subscribe({
      next: (cita) => {
        this.citaSeleccionada.set(cita);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al buscar la cita');
        this.loading.set(false);
      }
    });
  }

  formatearFechaSolo(fecha: string): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-MX', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatearHora(fecha: string): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaCreacion(fecha: string): string {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calcularDuracion(inicio: string, fin: string): string {
    if (!inicio || !fin) return '-';
    const msInicio = new Date(inicio).getTime();
    const msFin = new Date(fin).getTime();
    const minutos = Math.round((msFin - msInicio) / 60000);
    if (minutos < 0) return '0 min';
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  }

  esCitaProxima(fecha: string): boolean {
    if (!fecha) return false;
    const ahora = new Date();
    const citaDate = new Date(fecha);
    const diferenciaHoras = (citaDate.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    return diferenciaHoras > 0 && diferenciaHoras <= 24;
  }

  getEstadoClass(estado: string): string {
    const mapa: Record<string, string> = {
      'confirmada': 'success',
      'completada': 'info',
      'cancelada': 'danger',
      'pendiente': 'warning'
    };
    return mapa[estado] || 'secondary';
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

}

