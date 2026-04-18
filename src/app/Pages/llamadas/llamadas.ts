import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { LlamadasService } from '../../services/llamadas.service';
import { PacientesService } from '../../services/pacientes.service';
import { Llamada } from '../../models/llamada.model';

@Component({
  selector: 'app-llamadas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, TagModule, InputTextModule, PanelModule, AvatarModule],
  templateUrl: './llamadas.html',
  styleUrl: './llamadas.css'
})
export class LlamadasComponent implements OnInit {
  private llamadasService = inject(LlamadasService);
  private pacientesService = inject(PacientesService);

  ngOnInit() {
    this.llamadasService.cargarLlamadasDelBackend();
  }
  
  searchQuery = signal('');
  filtroActivo = signal<'todas' | 'grave' | 'moderado' | 'leve' | 'normal'>('todas');
  llamadaSeleccionada = signal<Llamada | null>(null);
  
  readonly todas = computed(() => this.llamadasService.llamadasList());
  readonly graves = this.llamadasService.graves;
  readonly moderados = this.llamadasService.moderados;
  readonly leves = this.llamadasService.leves;
  
  readonly llamadasFiltradas = computed(() => {
    let lista = this.llamadasService.llamadasList();
    const filtro = this.filtroActivo();
    const buscar = this.searchQuery().toLowerCase().trim();
    
    if (filtro !== 'todas') {
      lista = lista.filter(l => l.clasificacion === filtro);
    }
    
    if (buscar) {
      lista = lista.filter(l => 
        l.pacienteNombre.toLowerCase().includes(buscar) ||
        l.descripcion.toLowerCase().includes(buscar)
      );
    }
    
    return lista.sort((a, b) => new Date(b.horaInicio).getTime() - new Date(a.horaInicio).getTime());
  });
  
  readonly pacienteActual = computed(() => {
    const ll = this.llamadaSeleccionada();
    if (!ll) return null;
    return this.pacientesService.getPaciente(ll.pacienteId);
  });
  
  readonly historialPaciente = computed(() => {
    const paciente = this.pacienteActual();
    if (!paciente) return [];
    return this.llamadasService.getLlamadasPorPaciente(paciente.id).slice(0, 5);
  });
  
  buscar(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }
  
  setFiltro(filtro: 'todas' | 'grave' | 'moderado' | 'leve' | 'normal'): void {
    this.filtroActivo.set(filtro);
  }
  
  seleccionarLlamada(llamada: Llamada): void {
    this.llamadaSeleccionada.set(llamada);
  }
  
  getSeverity(gravedad: string): 'danger' | 'warn' | 'success' | 'info' {
    const map: Record<string, 'danger' | 'warn' | 'success' | 'info'> = {
      'grave': 'danger',
      'moderado': 'warn',
      'leve': 'success',
      'normal': 'info'
    };
    return map[gravedad] || 'info';
  }
  
  getEstadoSeverity(estado: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      'resuelta': 'success',
      'en_proceso': 'warn',
      'escalada': 'danger',
      'entrante': 'secondary',
      'cancelada': 'secondary'
    };
    return map[estado] || 'secondary';
  }
  
  getLabelClasificacion(gravedad: string): string {
    const map: Record<string, string> = {
      'grave': 'EMERGENCIA',
      'moderado': 'MODERADO',
      'leve': 'LEVE',
      'normal': 'NORMAL'
    };
    return map[gravedad] || gravedad.toUpperCase();
  }
  
  getLabelEstado(estado: string): string {
    const map: Record<string, string> = {
      'resuelta': 'Resuelta',
      'en_proceso': 'En Proceso',
      'escalada': 'Escalada',
      'entrante': 'Entrante',
      'cancelada': 'Cancelada'
    };
    return map[estado] || estado;
  }
  
  formatHora(date?: Date): string {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
  
  formatFecha(date: Date): string {
    return new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }
  
  formatDuracion(segundos?: number): string {
    if (!segundos) return '--:--';
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatFechaHora(date: Date): string {
    if (!date) return '--/--';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  getAgenteNombre(agenteId?: string): string {
    if (!agenteId) return 'IA Asistente';
    const agentes: Record<string, string> = {
      'ia1': 'IA Asistente',
      'ia2': 'Asesor Nutricional',
      'ia3': 'Asesor Pediátrico',
      'ia4': 'Asesor Cardíaco'
    };
    return agentes[agenteId] || 'IA Asistente';
  }

  getAgenteLabel(tipo: string): string {
    const map: Record<string, string> = {
      'nutriologo': 'Nutricionista',
      'pediatra': 'Pediatra',
      'cardiologo': 'Cardiólogo',
      'geriatra': 'Geriatra'
    };
    return map[tipo] || tipo;
  }

  getTiempoAgora(horaInicio: Date): Date {
    return horaInicio;
  }

  async crearEmergencia(): Promise<void> {
    console.log('🚨 [COMPONENTE] Iniciando creación de emergencia...');
    const nuevaEmergencia = await this.llamadasService.crearLlamadaEmergencia();
    if (nuevaEmergencia) {
      console.log('✅ [COMPONENTE] Emergencia creada! ID:', nuevaEmergencia.id);
      this.seleccionarLlamada(nuevaEmergencia);
      // Mostrar notificación (opcional)
      alert(`✅ Emergencia creada:\nID: ${nuevaEmergencia.id}\nClasificación: ${nuevaEmergencia.clasificacion}`);
    } else {
      console.error('❌ [COMPONENTE] Error al crear emergencia');
      alert('❌ Error al crear la emergencia. Revisa la consola.');
    }
  }
}