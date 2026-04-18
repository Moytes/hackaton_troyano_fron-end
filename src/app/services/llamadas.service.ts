import { Injectable, signal, computed, inject } from '@angular/core';
import { Llamada, Clasificacion, EstadoLlamada, FiltroLlamadas } from '../models/llamada.model';
import { LLAMADAS_MOCK } from '../data/mock-data';
import { LlamadasHttpService } from './llamadas-http.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LlamadasService {
  private llamadas = signal<Llamada[]>(LLAMADAS_MOCK);
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

  async cargarLlamadasDelBackend(): Promise<void> {
    try {
      console.log('📱 [SERVICIO] Iniciando carga de llamadas del backend...');
      const calls = await firstValueFrom(this.httpService.getAllCalls());

      console.log('📊 [SERVICIO] Llamadas recibidas del backend:', calls.length);
      console.log('🔍 [SERVICIO] Datos RAW del backend:', calls);

      const llamadasMapeadas = calls.map((call, index) =>
        this.httpService.mapBackendToLlamada(call, index)
      );

      console.log('✅ [SERVICIO] Llamadas mapeadas:', llamadasMapeadas.length);
      console.log('📋 [SERVICIO] Llamadas finales:', llamadasMapeadas);
      console.log('🏷️  [SERVICIO] Clasificaciones cargadas:',
        llamadasMapeadas.map(l => ({ id: l.id, clasificacion: l.clasificacion }))
      );

      this.llamadas.set(llamadasMapeadas);
      this.cargado.set(true);

      console.log('🎉 [SERVICIO] Carga completada. Total en señal:', this.llamadas().length);
    } catch (error) {
      console.error('❌ [SERVICIO] Error al cargar llamadas del backend:', error);
      console.warn('⚠️  [SERVICIO] Usando datos MOCK como fallback');
      this.cargado.set(true);
    }
  }

  async cargarLlamadasDelBackendPorUsuario(userId: string): Promise<void> {
    try {
      console.log(`📱 [SERVICIO] Cargando llamadas para usuario: ${userId}`);
      const calls = await firstValueFrom(this.httpService.getCallsByUserId(userId));
      const llamadasMapeadas = calls.map((call, index) =>
        this.httpService.mapBackendToLlamada(call, index)
      );
      this.llamadas.set(llamadasMapeadas);
      this.cargado.set(true);
      console.log(`✅ [SERVICIO] Se cargaron ${llamadasMapeadas.length} llamadas para el usuario`);
    } catch (error) {
      console.error(`❌ [SERVICIO] Error cargando llamadas del usuario ${userId}:`, error);
      this.cargado.set(true);
    }
  }

  async cargarLlamadasPorClasificacion(clasificacion: string): Promise<void> {
    try {
      console.log(`📱 [SERVICIO] Cargando llamadas por clasificación: ${clasificacion}`);
      const calls = await firstValueFrom(this.httpService.getCallsByClassification(clasificacion));
      const llamadasMapeadas = calls.map((call, index) =>
        this.httpService.mapBackendToLlamada(call, index)
      );
      this.llamadas.set(llamadasMapeadas);
      this.cargado.set(true);
      console.log(`✅ [SERVICIO] Se cargaron ${llamadasMapeadas.length} llamadas con clasificación: ${clasificacion}`);
    } catch (error) {
      console.error(`❌ [SERVICIO] Error cargando llamadas por clasificación ${clasificacion}:`, error);
      this.cargado.set(true);
    }
  }

  async crearLlamadaEmergencia(): Promise<Llamada | null> {
    try {
      console.log('🚨 [SERVICIO] Iniciando creación de llamada de emergencia...');
      const callResponse = await firstValueFrom(this.httpService.createEmergencyCall());
      const llamadaMapeada = this.httpService.mapBackendToLlamada(callResponse, 0);

      console.log('✅ [SERVICIO] Emergencia creada y mapeada:', llamadaMapeada);

      // Agregar a la lista existente
      this.llamadas.update(list => [llamadaMapeada, ...list]);

      console.log('📋 [SERVICIO] Total llamadas después de crear emergencia:', this.llamadas().length);
      return llamadaMapeada;
    } catch (error) {
      console.error('❌ [SERVICIO] Error creando llamada de emergencia:', error);
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