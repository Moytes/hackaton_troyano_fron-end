import { Injectable, signal, computed } from '@angular/core';
import { Alerta, TipoAlerta } from '../models/alerta.model';
import { ALERTAS_MOCK } from '../data/mock-data';

@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  private alertas = signal<Alerta[]>(ALERTAS_MOCK);
  
  readonly alertasList = this.alertas.asReadonly();
  
  readonly sinLeer = computed(() => 
    this.alertas().filter(a => !a.leida)
  );
  
  readonly emergencias = computed(() => 
    this.alertas().filter(a => a.tipo === 'emergencia' && !a.leida)
  );
  
  readonly recordatorios = computed(() => 
    this.alertas().filter(a => a.tipo === 'recordatorio')
  );
  
  readonly ultimasAlertas = computed(() => 
    this.alertas()
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
      .slice(0, 10)
  );
  
  getAlertasPorPaciente(pacienteId: string): Alerta[] {
    return this.alertas().filter(a => a.pacienteId === pacienteId);
  }
  
  getAlertasPorTipo(tipo: TipoAlerta): Alerta[] {
    return this.alertas().filter(a => a.tipo === tipo);
  }
  
  marcarComoLeida(id: string): void {
    this.alertas.update(list =>
      list.map(a => a.id === id ? { ...a, leida: true, fechaLectura: new Date() } : a)
    );
  }
  
  marcarTodasComoLeidas(): void {
    const ahora = new Date();
    this.alertas.update(list =>
      list.map(a => a.leida ? a : { ...a, leida: true, fechaLectura: ahora })
    );
  }
  
  agregarAlerta(alerta: Omit<Alerta, 'id' | 'leida' | 'fechaCreacion'>): void {
    const nueva: Alerta = {
      ...alerta,
      id: `a${Date.now()}`,
      leida: false,
      fechaCreacion: new Date()
    };
    this.alertas.update(list => [nueva, ...list]);
  }
}