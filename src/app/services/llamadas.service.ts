import { Injectable, signal, computed } from '@angular/core';
import { Llamada, Clasificacion, EstadoLlamada, FiltroLlamadas } from '../models/llamada.model';
import { LLAMADAS_MOCK } from '../data/mock-data';

@Injectable({
  providedIn: 'root'
})
export class LlamadasService {
  private llamadas = signal<Llamada[]>(LLAMADAS_MOCK);
  private filtroActual = signal<FiltroLlamadas>({});
  
  readonly llamadasList = this.llamadas.asReadonly();
  
  readonly llamadasFiltradas = computed(() => {
    const filtro = this.filtroActual();
    let result = this.llamadas();
    
    if (filtro.clasificacion) {
      result = result.filter(l => l.clasificacion === filtro.clasificacion);
    }
    if (filtro.estado) {
      result = result.filter(l => l.estado === filtro.estado);
    }
    if (filtro.search) {
      const q = filtro.search.toLowerCase();
      result = result.filter(l => 
        l.pacienteNombre.toLowerCase().includes(q) ||
        l.descripcion.toLowerCase().includes(q)
      );
    }
    
    return result.sort((a, b) => this.ordenarPorGravedad(a) - this.ordenarPorGravedad(b));
  });
  
  readonly graves = computed(() => this.llamadas().filter(l => l.clasificacion === 'grave'));
  readonly moderados = computed(() => this.llamadas().filter(l => l.clasificacion === 'moderado'));
  readonly leves = computed(() => this.llamadas().filter(l => l.clasificacion === 'leve'));
  readonly normales = computed(() => this.llamadas().filter(l => l.clasificacion === 'normal'));
  
  readonly sinAtender = computed(() => 
    this.llamadas().filter(l => l.estado === 'entrante' || l.estado === 'en_proceso')
  );
  
  setFiltro(filtro: FiltroLlamadas): void {
    this.filtroActual.set(filtro);
  }
  
  clearFiltro(): void {
    this.filtroActual.set({});
  }
  
  getLlamada(id: string): Llamada | undefined {
    return this.llamadas().find(l => l.id === id);
  }
  
  getLlamadasPorPaciente(pacienteId: string): Llamada[] {
    return this.llamadas()
      .filter(l => l.pacienteId === pacienteId)
      .sort((a, b) => new Date(b.horaInicio).getTime() - new Date(a.horaInicio).getTime());
  }
  
  getLlamadaActiva(): Llamada | undefined {
    return this.llamadas().find(l => l.estado === 'en_proceso' || l.estado === 'entrante');
  }
  
  actualizarLlamada(id: string, datos: Partial<Llamada>): void {
    this.llamadas.update(list =>
      list.map(l => l.id === id ? { ...l, ...datos } : l)
    );
  }
  
  private ordenarPorGravedad(l: Llamada): number {
    const orden: Record<Clasificacion, number> = {
      'grave': 0,
      'moderado': 1,
      'leve': 2,
      'normal': 3
    };
    return orden[l.clasificacion];
  }
}