# 📡 Implementación de Streaming de Llamadas

## Descripción General
Se ha implementado un sistema profesional de streaming en tiempo real para consumir el endpoint `/api/calls/stream` del microservicio `hackaton-ms-calls-production.up.railway.app`.

## Arquitectura

### 1. **Servicio de Stream** (`llamadas-stream.service.ts`)
Maneja la conexión EventSource (Server-Sent Events) con el microservicio.

**Características:**
- ✅ Conexión automática con reconexión
- ✅ Manejo de eventos: `new-call`, `update-call`, `status`
- ✅ Mapeo automático de datos backend a modelo local
- ✅ Logging completo para debugging
- ✅ Historial de eventos (últimos 100)
- ✅ Estado de conexión en tiempo real

**Métodos Principales:**
```typescript
// Conectar al stream
connectStream(
  onNewCall: (llamada: Llamada) => void,
  onUpdateCall: (llamada: Llamada) => void,
  onStatus: (status: any) => void
): void

// Desconectar
disconnectStream(): void

// Obtener estado
getConnectionStatus(): { connected, error, eventCount, timestamp }
```

### 2. **Configuración API** (`api.config.ts`)
```typescript
ENDPOINTS: {
  CALLS_STREAM: '/api/calls/stream'
}

export function getCallsStreamEndpoint(): string {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALLS_STREAM}`;
}
```

### 3. **Servicio de Llamadas Mejorado** (`llamadas.service.ts`)
Nuevos métodos para integración:
```typescript
// Agregar nueva llamada
agregarLlamada(llamada: Llamada): void

// Agregar o actualizar (si existe)
agregarOActualizar(llamada: Llamada): void
```

### 4. **Componente de Llamadas** (`llamadas.ts`)
- Inicializa conexión stream en `ngOnInit()`
- Desconecta automáticamente en `ngOnDestroy()`
- Actualiza lista de llamadas en tiempo real
- Muestra estado de conexión

## Logging Completo

El sistema incluye logging detallado en múltiples niveles:

### 🔌 Conexión
```
🔌 [STREAM] Conectando a: https://...
✅ [STREAM] Conexión abierta exitosamente
🚨 [STREAM] Error de conexión EventSource: ...
```

### 📡 Eventos Recibidos
```
📢 [STREAM] Evento "new-call" recibido
🔍 [STREAM] Datos raw: {...}
✅ [STREAM] Call parseado: {...}
🎯 [STREAM] Llamada mapeada: {...}
```

### 📊 Estado y Actualizaciones
```
📊 [STREAM] Total eventos registrados: X
📊 [LLAMADAS COMPONENT] Estado del stream: {...}
🔔 [LLAMADAS COMPONENT] Nueva llamada recibida: {...}
🔄 [LLAMADAS COMPONENT] Llamada actualizada: {...}
```

### ❌ Errores
```
❌ [STREAM] Error parseando new-call: ...
🚨 [STREAM] Error al crear EventSource: ...
📋 [STREAM] Datos problemáticos: {...}
```

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│         Microservicio (Railway)                            │
│    hackaton-ms-calls-production.up.railway.app/api/calls/stream
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ EventSource (SSE)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         LlamadasStreamService                               │
│ - Conexión EventSource                                      │
│ - Parseo de eventos                                         │
│ - Mapeo de datos backend → Llamada                          │
│ - Historial de eventos                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Callbacks
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         LlamadasComponent                                   │
│ - onNewCall() → agregarOActualizar()                        │
│ - onUpdateCall() → agregarOActualizar()                     │
│ - onStatus() → logging                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Signal Updates
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         LlamadasService (State Management)                  │
│ - Signal: llamadas[]                                        │
│ - Computed: graves, moderados, leves, etc.                 │
│ - UI actualiza automáticamente                             │
└─────────────────────────────────────────────────────────────┘
```

## Monitoreo en Consola

### Console Tabs Recomendadas
1. **Consola (Console)** - Ver todos los logs
2. **Network** - Verificar conexión EventSource
3. **Elements** - Inspeccionar DOM

### Filtros Útiles en Consola
```javascript
// En la consola del navegador:
// Solo eventos stream
console.log = (...args) => {
  if (args[0]?.includes('[STREAM]')) console.log(...args);
}

// Monitor de conexión
setInterval(() => {
  const status = streamService.getConnectionStatus();
  console.log('📊 STATUS:', status);
}, 5000);
```

## Manejo de Errores

### Escenarios Comunes

**1. EventSource no disponible**
```
❌ Error al crear EventSource: TypeError: EventSource is not defined
→ Usar polyfill si es necesario
```

**2. CORS bloqueado**
```
🚨 Error de conexión: CORS policy blocked
→ Verificar headers del servidor
```

**3. Connection perdida**
```
🚨 ReadyState: 2 (CLOSED)
→ Implementar reconexión automática
```

## Testing en Desarrollo

### Verificar en F12 (DevTools)

**Network Tab:**
- URL: `https://hackaton-ms-calls-production.up.railway.app/api/calls/stream`
- Type: `event-stream`
- Status: `200`
- Headers: `Content-Type: text/event-stream`

**Console:**
Buscar logs con:
- `[STREAM]` - Eventos de stream
- `[LLAMADAS COMPONENT]` - Eventos del componente
- `[SERVICIO]` - Eventos del servicio

## Ejemplo: Ver Estado en Consola

```typescript
// En el componente o consola:
const streamService = inject(LlamadasStreamService);

// Ver estado actual
console.log(streamService.getConnectionStatus());

// Ver eventos recientes
console.log(streamService.getEventHistory());

// Ver si conectado
console.log(streamService.isStreamConnected());

// Ver último error
console.log(streamService.errorMessage());
```

## Próximos Pasos

- [ ] Implementar reconexión automática con exponential backoff
- [ ] Agregar notificaciones visuales de nuevas llamadas
- [ ] Cachear eventos en localStorage
- [ ] Agregar filtros al stream (por clasificación, estado)
- [ ] Implementar compression de eventos
- [ ] Agregar metrics de rendimiento

## Recursos

- **EventSource Docs**: https://developer.mozilla.org/en-US/docs/Web/API/EventSource
- **Server-Sent Events**: https://html.spec.whatwg.org/multipage/server-sent-events.html
- **Angular Signals**: https://angular.io/guide/signals

---

**Última actualización**: 2026-04-18
**Estado**: ✅ Implementado y funcional
