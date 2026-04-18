import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { CitasApiService } from '../../services/citas-api.service';

interface Doctor {
  id: number;
  nombre: string;
  especialidad: string;
  activo: boolean;
  citasAsignadas: number;
  pacientesAtendidos: number;
  ultimoAcceso?: string;
}

@Component({
  selector: 'app-doctor',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    CardModule,
    FormsModule
  ],
  templateUrl: './doctor.component.html',
  styleUrl: './doctor.component.css'
})
export class DoctorComponent implements OnInit {
  private citasService = inject(CitasApiService);

  // Lista de doctores con datos mock
  doctoresData: Doctor[] = [
    {
      id: 1,
      nombre: 'Dr. Juan Pérez López',
      especialidad: 'Cardiología',
      activo: true,
      citasAsignadas: 0,
      pacientesAtendidos: 0
    },
    {
      id: 2,
      nombre: 'Dra. María García Rodríguez',
      especialidad: 'Pediatría',
      activo: true,
      citasAsignadas: 0,
      pacientesAtendidos: 0
    },
    {
      id: 3,
      nombre: 'Dr. Carlos López González',
      especialidad: 'Cirugía General',
      activo: true,
      citasAsignadas: 0,
      pacientesAtendidos: 0
    },
    {
      id: 4,
      nombre: 'Dra. Ana Martínez Silva',
      especialidad: 'Oftalmología',
      activo: false,
      citasAsignadas: 0,
      pacientesAtendidos: 0
    },
    {
      id: 5,
      nombre: 'Dr. Roberto Sánchez Díaz',
      especialidad: 'Traumatología',
      activo: true,
      citasAsignadas: 0,
      pacientesAtendidos: 0
    },
    {
      id: 6,
      nombre: 'Dra. Elena Torres Gómez',
      especialidad: 'Dermatología',
      activo: true,
      citasAsignadas: 0,
      pacientesAtendidos: 0
    }
  ];

  doctores = signal<Doctor[]>(this.doctoresData);
  loading = signal(false);
  filtro = signal('');
  mostrarSoloActivos = signal(false);

  // Computed
  doctoresFiltrados = computed(() => {
    const filtroText = this.filtro().toLowerCase();
    const soloActivos = this.mostrarSoloActivos();

    return this.doctores().filter(doctor => {
      const cumpleFiltro = !filtroText ||
        doctor.nombre.toLowerCase().includes(filtroText) ||
        doctor.especialidad.toLowerCase().includes(filtroText);

      const cumpleEstado = !soloActivos || doctor.activo;

      return cumpleFiltro && cumpleEstado;
    });
  });

  totalDoctores = computed(() => this.doctores().length);
  doctoresActivos = computed(() =>
    this.doctores().filter(d => d.activo).length
  );
  doctoresInactivos = computed(() =>
    this.doctores().filter(d => !d.activo).length
  );
  totalCitasAsignadas = computed(() =>
    this.doctores().reduce((sum, d) => sum + d.citasAsignadas, 0)
  );

  ngOnInit(): void {
    this.cargarEstadisticasDoctores();
  }

  cargarEstadisticasDoctores(): void {
    this.loading.set(true);

    // Obtener todas las citas
    this.citasService.obtenerTodasLasCitas().subscribe({
      next: (citas) => {
        // Actualizar estadísticas de cada doctor
        const doctoresActualizados = this.doctores().map(doctor => {
          const citasDoctor = citas.filter(c => c.doctorId === doctor.id);
          const pacientesUnicos = new Set(citasDoctor.map(c => c.pacienteId)).size;

          return {
            ...doctor,
            citasAsignadas: citasDoctor.length,
            pacientesAtendidos: pacientesUnicos
          };
        });

        this.doctores.set(doctoresActualizados);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
        this.loading.set(false);
      }
    });
  }

  getEstadoClass(activo: boolean): string {
    return activo ? 'success' : 'danger';
  }

  getEstadoLabel(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  toggleFiltroActivos(): void {
    this.mostrarSoloActivos.update(v => !v);
  }

  filtrarDoctores(event: any): void {
    const texto = (event.target as HTMLInputElement).value;
    this.filtro.set(texto);
  }
}
