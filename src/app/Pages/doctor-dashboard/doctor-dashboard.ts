import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
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
    InputTextModule,
    TooltipModule
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
  filtroEstado = signal<string>('');
  doctorId = computed(() => {
    const usuario = this.authService.usuario();
    return usuario ? parseInt(usuario.id.replace('u', ''), 10) : 0;
  });

  nombreDoctor = computed(() => this.authService.getNombreCompleto());
  especialidad = computed(() => this.authService.getEspecialidad());

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
  citasPendientes = computed(() =>
    this.citas().filter(c => c.estado === 'pendiente').length
  );
  pacientesUnicos = computed(() =>
    new Set(this.citas().map(c => c.pacienteId)).size
  );

  citasFiltradas = computed(() => {
    const filtroText = this.filtro().toLowerCase();
    const estado = this.filtroEstado();

    return this.citas().filter(cita => {
      const cumpleFiltroTexto = !filtroText ||
        cita.pacienteNombre.toLowerCase().includes(filtroText) ||
        cita.pacienteTelefono.toLowerCase().includes(filtroText) ||
        cita.motivo.toLowerCase().includes(filtroText);

      const cumpleEstado = !estado || cita.estado === estado;

      return cumpleFiltroTexto && cumpleEstado;
    });
  });

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.loading.set(true);
    this.error.set('');

    const doctorId = this.doctorId();
    const usuario = this.authService.usuario();

    console.group('📋 CARGAR CITAS');
    console.log('Doctor ID:', doctorId);
    console.log('Usuario:', usuario);
    console.log('Cargando citas del doctor...');
    console.groupEnd();

    if (doctorId > 0) {
      this.citasService.obtenerCitasPorDoctor(doctorId).subscribe({
        next: (citas) => {
          console.group('✅ RESPUESTA DEL ENDPOINT');
          console.log('Total de citas recibidas:', citas.length);
          console.log('Estructura completa:', citas);

          if (citas.length > 0) {
            console.log('Primera cita (ejemplo):', citas[0]);
            console.log('Campos disponibles:', Object.keys(citas[0]));

            citas.forEach((cita, index) => {
              console.log(`Cita ${index + 1}:`, {
                id: cita.id,
                paciente: cita.pacienteNombre,
                telefono: cita.pacienteTelefono,
                motivo: cita.motivo,
                estado: cita.estado,
                fechaInicio: cita.fechaHoraInicio,
                fechaFin: cita.fechaHoraFin,
                doctorId: cita.doctorId,
                pacienteId: cita.pacienteId,
                createdAt: cita.createdAt
              });
            });
          }
          console.groupEnd();

          this.citas.set(citas);
          this.loading.set(false);
        },
        error: (err) => {
          console.group('❌ ERROR AL CARGAR CITAS');
          console.error('Error completo:', err);
          console.error('Status:', err.status);
          console.error('Mensaje:', err.message);
          console.error('Response:', err.error);
          console.groupEnd();

          this.error.set('Error al cargar las citas. Por favor intenta de nuevo.');
          this.loading.set(false);
        }
      });
    } else {
      console.error('⚠️ Doctor ID inválido:', doctorId);
      this.error.set('No se pudo obtener el ID del doctor.');
      this.loading.set(false);
    }
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
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    const ahora = new Date();
    const citaDate = new Date(fecha);
    const diferenciaHoras = (citaDate.getTime() - ahora.getTime()) / (1000 * 60 * 60);
    return diferenciaHoras > 0 && diferenciaHoras <= 24;
  }

  filtrarCitas(event: any): void {
    const texto = (event.target as HTMLInputElement).value;
    this.filtro.set(texto);
  }

  filtrarPorEstado(event: any): void {
    const estado = (event.target as HTMLSelectElement).value;
    this.filtroEstado.set(estado);
  }
}
