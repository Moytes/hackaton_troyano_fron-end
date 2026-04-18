import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FechaService {
  // Zona horaria de México: America/Mexico_City (UTC-6 invierno, UTC-5 verano)
  private readonly ZONA_HORARIA = 'America/Mexico_City';
  private readonly LOCALE = 'es-MX';

  /**
   * Parsea de forma segura una cadena de fecha del backend,
   * asegurando que sea tratada como UTC si no tiene indicadores de zona.
   */
  parseDate(dateInput: string | Date | undefined | null): Date {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date) return dateInput;

    try {
      const dateStr = dateInput.trim();
      
      // Intentar extraer componentes si es formato YYYY-MM-DD HH:MM:SS (típico de DB)
      // Esto fuerza UTC sin depender de la implementación de new Date() en el navegador
      const regex = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
      const match = dateStr.match(regex);
      
      if (match && !dateStr.includes('Z') && !dateStr.includes('+') && !dateStr.includes('GMT')) {
        return new Date(Date.UTC(
          parseInt(match[1]),
          parseInt(match[2]) - 1,
          parseInt(match[3]),
          parseInt(match[4]),
          parseInt(match[5]),
          parseInt(match[6])
        ));
      }

      // Fallback para otros formatos (ISO real, etc)
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch {
      return new Date();
    }
  }

  /**
   * Convierte fecha a zona horaria de México
   */
  private convertirAMexico(fecha: Date): Date {
    try {
      // Usar a-f-t (America/Mexico_City) para obtener las partes
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: this.ZONA_HORARIA,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
      });

      const partes = formatter.formatToParts(fecha);
      const m: Record<string, string> = {};
      partes.forEach(p => m[p.type] = p.value);

      // Crear un objeto Date que represente la misma "cara del reloj" pero en el contexto local para comparaciones de día
      return new Date(
        parseInt(m['year']),
        parseInt(m['month']) - 1,
        parseInt(m['day']),
        parseInt(m['hour']),
        parseInt(m['minute']),
        parseInt(m['second'])
      );
    } catch (e) {
      console.error('Error al convertir fecha a México:', e);
      return fecha;
    }
  }

  /**
   * Obtiene label de día: "HOY", "AYER" o fecha corta (ej: "18 ABR")
   */
  getDiaLabel(fecha: Date): string {
    const fechaMx = this.convertirAMexico(fecha);
    const hoy = this.convertirAMexico(new Date());

    const fechaHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const fechaLlamada = new Date(fechaMx.getFullYear(), fechaMx.getMonth(), fechaMx.getDate());

    const ayer = new Date(fechaHoy);
    ayer.setDate(ayer.getDate() - 1);

    if (fechaLlamada.getTime() === fechaHoy.getTime()) {
      return 'HOY';
    }
    if (fechaLlamada.getTime() === ayer.getTime()) {
      return 'AYER';
    }

    const formatter = new Intl.DateTimeFormat(this.LOCALE, {
      timeZone: this.ZONA_HORARIA,
      day: 'numeric',
      month: 'short'
    });
    return formatter.format(fecha).toUpperCase();
  }

  /**
   * Formatea hora: HH:MM (Zona horaria México)
   */
  formatHora(fecha: Date): string {
    if (!fecha) return '--:--';
    try {
      // Usar el helper consolidado para asegurar consistencia
      const fechaMx = this.convertirAMexico(fecha);
      const h = fechaMx.getHours().toString().padStart(2, '0');
      const m = fechaMx.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    } catch {
      return '--:--';
    }
  }

  /**
   * Formatea fecha: DD de MMMM de YYYY
   */
  formatFechaLarga(fecha: Date): string {
    if (!fecha) return '--';
    try {
      const formatter = new Intl.DateTimeFormat(this.LOCALE, {
        timeZone: this.ZONA_HORARIA,
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return formatter.format(fecha);
    } catch {
      return '--';
    }
  }

  /**
   * Formatea fecha corta: DD/MMM
   */
  formatFechaCorta(fecha: Date): string {
    if (!fecha) return '--';
    try {
      const formatter = new Intl.DateTimeFormat(this.LOCALE, {
        timeZone: this.ZONA_HORARIA,
        day: 'numeric',
        month: 'short'
      });
      return formatter.format(fecha);
    } catch {
      return '--';
    }
  }

  /**
   * Formatea fecha y hora combinadas: DD MMM, HH:MM
   */
  formatFechaHora(fecha: Date): string {
    if (!fecha) return '--/--';
    try {
      const fechaMx = this.convertirAMexico(fecha);
      const dia = fechaMx.getDate().toString().padStart(2, '0');
      const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      const mes = meses[fechaMx.getMonth()];
      const hora = fechaMx.getHours().toString().padStart(2, '0');
      const min = fechaMx.getMinutes().toString().padStart(2, '0');
      
      return `${dia} ${mes}, ${hora}:${min}`;
    } catch {
      return '--/--';
    }
  }

  /**
   * Calcula tiempo relativo: "hace X minutos", "hace X horas", etc
   */
  tiempoRelativo(fecha: Date): string {
    if (!fecha) return '--';
    try {
      // Para tiempo relativo, comparamos UTC vs UTC
      const ahoraVal = new Date().getTime();
      const fechaVal = fecha.getTime();
      const diferencia = ahoraVal - fechaVal;
      
      const segundos = Math.floor(diferencia / 1000);
      const minutos = Math.floor(segundos / 60);
      const horas = Math.floor(minutos / 60);
      const dias = Math.floor(horas / 24);

      if (segundos < 60) return 'hace momentos';
      if (minutos < 60) return `hace ${minutos}m`;
      if (horas < 24) return `hace ${horas}h`;
      if (dias < 30) return `hace ${dias}d`;

      return this.formatFechaCorta(fecha);
    } catch {
      return '--';
    }
  }

  /**
   * Obtiene timestamp para debugging (HH:MM:SS)
   */
  getTimestampDebug(fecha: Date): string {
    if (!fecha) return '--:--:--';
    try {
      const formatter = new Intl.DateTimeFormat(this.LOCALE, {
        timeZone: this.ZONA_HORARIA,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      return formatter.format(fecha);
    } catch {
      return '--:--:--';
    }
  }

  /**
   * Compara si dos fechas son del mismo día (Zona horaria México)
   */
  esMismoDia(fecha1: Date, fecha2: Date): boolean {
    try {
      const f1 = this.convertirAMexico(fecha1);
      const f2 = this.convertirAMexico(fecha2);
      return f1.toDateString() === f2.toDateString();
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el inicio del día (00:00:00) en zona horaria México
   */
  getInicioDia(fecha: Date): Date {
    const fechaMx = this.convertirAMexico(fecha);
    const d = new Date(fechaMx.getFullYear(), fechaMx.getMonth(), fechaMx.getDate(), 0, 0, 0, 0);
    return d;
  }

  /**
   * Obtiene el fin del día (23:59:59) en zona horaria México
   */
  getFinDia(fecha: Date): Date {
    const fechaMx = this.convertirAMexico(fecha);
    const d = new Date(fechaMx.getFullYear(), fechaMx.getMonth(), fechaMx.getDate(), 23, 59, 59, 999);
    return d;
  }
}
