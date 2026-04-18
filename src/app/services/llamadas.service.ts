import { Injectable, signal, computed, inject } from '@angular/core';
import { Llamada, Clasificacion, EstadoLlamada, FiltroLlamadas } from '../models/llamada.model';
import { LLAMADAS_MOCK } from '../data/mock-data';
import { LlamadasHttpService } from './llamadas-http.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LlamadasService {
  private llamadas = signal<Llamada[]>([]);
  private filtroActual = signal<FiltroLlamadas>({});
  private httpService = inject(LlamadasHttpService);
  private cargado = signal(false);
  
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

    return result.sort((a, b) => {
      const tiempoA = new Date(a.horaInicio).getTime();
      const tiempoB = new Date(b.horaInicio).getTime();
      return tiempoB - tiempoA;
    });
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

  agregarLlamada(llamada: Llamada): void {
    console.log('➕ [SERVICIO] Agregando nueva llamada:', llamada.id);
    this.llamadas.update(list => [llamada, ...list]);
  }

  agregarOActualizar(llamada: Llamada): void {
    const existe = this.llamadas().some(l => l.id === llamada.id);
    if (existe) {
      console.log('🔄 [SERVICIO] Actualizando llamada existente:', llamada.id);
      this.actualizarLlamada(llamada.id, llamada);
    } else {
      console.log('➕ [SERVICIO] Llamada nueva, agregando:', llamada.id);
      this.agregarLlamada(llamada);
    }
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

  async cargarLlamadasDelBackend(): Promise<void> {
    try {
      const calls = await firstValueFrom(this.httpService.getAllCalls());
      const llamadasMapeadas = calls.map((call, index) =>
        this.httpService.mapBackendToLlamada(call, index)
      );
      const llamadasOrdenadas = llamadasMapeadas.sort((a, b) => {
        const tiempoA = new Date(a.horaInicio).getTime();
        const tiempoB = new Date(b.horaInicio).getTime();
        return tiempoB - tiempoA;
      });
      this.llamadas.set(llamadasOrdenadas);
      this.cargado.set(true);
    } catch (error) {
      console.log('📡 GET /api/calls → Error, usando MOCK como fallback');
      this.llamadas.set(LLAMADAS_MOCK);
      this.cargado.set(true);
    }
  }

  async cargarLlamadasDelBackendPorUsuario(userId: string): Promise<void> {
    try {
      const calls = await firstValueFrom(this.httpService.getCallsByUserId(userId));
      const llamadasMapeadas = calls.map((call, index) =>
        this.httpService.mapBackendToLlamada(call, index)
      );
      const llamadasOrdenadas = llamadasMapeadas.sort((a, b) =>
        new Date(b.horaInicio).getTime() - new Date(a.horaInicio).getTime()
      );
      this.llamadas.set(llamadasOrdenadas);
      this.cargado.set(true);
    } catch (error) {
      console.log(`📡 GET /api/calls/user/:userId → Error, usando MOCK como fallback`);
      this.llamadas.set(LLAMADAS_MOCK.filter(l => l.pacienteId === userId));
      this.cargado.set(true);
    }
  }

  async cargarLlamadasPorClasificacion(clasificacion: string): Promise<void> {
    try {
      const calls = await firstValueFrom(this.httpService.getCallsByClassification(clasificacion));
      const llamadasMapeadas = calls.map((call, index) =>
        this.httpService.mapBackendToLlamada(call, index)
      );
      const llamadasOrdenadas = llamadasMapeadas.sort((a, b) =>
        new Date(b.horaInicio).getTime() - new Date(a.horaInicio).getTime()
      );
      this.llamadas.set(llamadasOrdenadas);
      this.cargado.set(true);
    } catch (error) {
      console.log(`📡 GET /api/calls/classification/:classification → Error, usando MOCK como fallback`);
      this.llamadas.set(LLAMADAS_MOCK.filter(l => l.clasificacion === clasificacion));
      this.cargado.set(true);
    }
  }

  async crearLlamadaEmergencia(): Promise<Llamada | null> {
    try {
      const callResponse = await firstValueFrom(this.httpService.createEmergencyCall());
      const llamadaMapeada = this.httpService.mapBackendToLlamada(callResponse, 0);
      this.llamadas.update(list => [llamadaMapeada, ...list]);
      return llamadaMapeada;
    } catch (error) {
      console.log('📡 POST /api/calls/emergency → Error creando emergencia');
      return null;
    }
  }

  isCargado(): boolean {
    return this.cargado();
  }

  recargarDatos(): void {
    this.cargado.set(false);
    this.cargarLlamadasDelBackend();
  }
}