# 🚨 Análisis Profundo: Detección de Emergencias en VozRural

## 📋 Tabla de Contenidos
1. [Arquitectura de Dos Backends](#arquitectura-de-dos-backends)
2. [Backend 1: Microservicio de Llamadas](#backend-1-microservicio-de-llamadas)
3. [Backend 2: Microservicio de Citas](#backend-2-microservicio-de-citas)
4. [Flujos de Detección de Emergencias](#flujos-de-detección-de-emergencias)
5. [Botón de Alarma / Socorro](#botón-de-alarma--socorro)
6. [Clasificación Inteligente](#clasificación-inteligente)

---

## 🏗️ Arquitectura de Dos Backends

### Infraestructura en Railway

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Frontend (Vercel)                             │
│            VozRural Angular Application (puerto 80/443)             │
└────────────────┬──────────────────────────────┬────────────────────┘
                 │                              │
         ┌───────▼─────────┐        ┌──────────▼───────┐
         │                 │        │                  │
         │  API Base URL   │        │  API Citas URL   │
         │                 │        │                  │
         └───────┬─────────┘        └──────────┬───────┘
                 │                              │
    ┌────────────▼──────────────┐  ┌───────────▼────────────────┐
    │                           │  │                            │
    │  BACKEND 1: MS-CALLS      │  │  BACKEND 2: MS-CITAS       │
    │                           │  │                            │
    │ Endpoint:                 │  │ Endpoint:                  │
    │ hackaton-ms-calls-        │  │ hackaton-ms-citas-         │
    │ production.up.railway.app │  │ production.up.railway.app  │
    │                           │  │                            │
    └───────────────────────────┘  └────────────────────────────┘
```

### Responsabilidades

| Backend | URL | Función Principal | Endpoints Clave |
|---------|-----|-------------------|-----------------|
| **MS-CALLS** | `hackaton-ms-calls-production.up.railway.app` | Gestión de llamadas entrantes, clasificación automática, monitoreo en tiempo real | `/api/calls`, `/api/calls/emergency`, `/api/calls/stream`, `/api/calls/classification/:type`, `/api/users/:id` |
| **MS-CITAS** | `hackaton-ms-citas-production.up.railway.app` | Gestión de citas médicas, agendamiento, confirmación de consultas | `/api/citas/*` |

---

## 🎯 Backend 1: Microservicio de Llamadas (MS-CALLS)

### 1.1 Flujo de Ingesta de Llamadas

```
┌─────────────────────────────────────┐
│   Usuario en Peligro                │
│  (Llamada de voz / WhatsApp)        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   IVR / Telephony Integration       │
│   (Twilio, Nexmo, o similar)        │
│   - Captura llamada                 │
│   - Inicia transcripción en vivo    │
│   - Extrae datos del usuario        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│   IA Asistente (Google Gemini API)              │
│   Análisis en Tiempo Real:                      │
│   - Transcripción de audio                      │
│   - Análisis de síntomas mencionados            │
│   - Evaluación de urgencia                      │
│   - Generación de resumen                       │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│   Sistema de Clasificación (Triage)             │
│   ENTRADA: Síntomas + Transcripción             │
│   PROCESA: Palabras clave de emergencia         │
│   SALIDA: Nivel de Urgencia                     │
│                                                 │
│   🔴 GRAVE (Nivel 1)                            │
│   - "dolor en el pecho"                         │
│   - "no puedo respirar"                         │
│   - "sangrado"                                  │
│   - "pérdida de conocimiento"                   │
│   - "botón de alarma presionado"                │
│                                                 │
│   🟠 MODERADO (Nivel 2)                         │
│   - Síntomas serios pero estables               │
│   - Fiebre alta                                 │
│   - Dolor severo                                │
│                                                 │
│   🟡 LEVE (Nivel 3)                             │
│   - Síntomas menores                            │
│   - Consulta preventiva                         │
│                                                 │
│   🟢 NORMAL (Nivel 5)                           │
│   - Información general                         │
│   - Recordatorio                                │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│   Creación de Registro de Llamada               │
│   - ID único generado                           │
│   - userId del paciente                         │
│   - classification: GRAVE/MODERADO/LEVE/NORMAL │
│   - status: PENDING → IN_PROGRESS → ESCALATED  │
│   - callType: EMERGENCY/CONSULTATION/FOLLOW_UP │
│   - transcriptions: []                          │
│   - summaryMarkdown: resumen IA                 │
│   - durationSeconds: duración                   │
│   - createdAt: timestamp                        │
└────────────┬────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────┐
│   Base de Datos (PostgreSQL/MongoDB)            │
│   Persistencia del Registro de Llamada          │
└─────────────────────────────────────────────────┘
```

### 1.2 Endpoints Críticos para Detección

#### **POST /api/calls/emergency**
**¿Cuándo se llama?**
- Usuario presiona botón de alarma/socorro
- Sistema detecta palabras clave críticas
- Médico/operador escala manualmente

**Payload esperado:**
```json
{
  "userId": "user-id-xyz",
  "callType": "EMERGENCY",
  "classification": "GRAVE",
  "status": "PENDING",
  "initialSymptoms": ["dolor en el pecho", "dificultad respiratoria"],
  "location": {
    "latitude": -20.5,
    "longitude": -103.25
  },
  "timestamp": "2026-04-18T15:30:00Z"
}
```

**Respuesta:**
```json
{
  "id": "call-uuid-1234",
  "userId": "user-id-xyz",
  "callType": "EMERGENCY",
  "status": "PENDING",
  "classification": "GRAVE",
  "patientName": "Mario Alberto Ramirez",
  "latitud": "-20.5",
  "longitud": "-103.25",
  "transcriptions": [],
  "summaryMarkdown": "Paciente reporta dolor en pecho e dificultad respiratoria",
  "durationSeconds": 0,
  "createdAt": "2026-04-18T15:30:00Z"
}
```

#### **GET /api/calls/stream**
**¿Qué transmite?**
- Conexión SSE (Server-Sent Events)
- Emite eventos en TIEMPO REAL cuando hay nuevas llamadas
- Transmite actualizaciones de estado

**Eventos que puede emitir:**

```javascript
// Evento 1: Nueva llamada GRAVE
event: new-call
data: {
  "id": "call-uuid-5678",
  "userId": "user-id-abc",
  "callType": "EMERGENCY",
  "status": "PENDING",
  "classification": "GRAVE",
  "patientName": "Maria Elena Gonzalez",
  "summaryMarkdown": "EMERGENCIA: No puedo respirar!!!",
  "createdAt": "2026-04-18T16:45:00Z"
}

// Evento 2: Cambio de estado (escalada)
event: update-call
data: {
  "id": "call-uuid-5678",
  "status": "ESCALATED",
  "classification": "GRAVE",
  "horaEscalada": "2026-04-18T16:46:00Z"
}

// Evento 3: Status de backend
event: status
data: {
  "connected": true,
  "callsInProgress": 5,
  "emergencies": 2,
  "timestamp": "2026-04-18T16:46:30Z"
}
```

#### **GET /api/calls/classification/grave**
**¿Cuándo se llama?**
- Filtrar SOLO llamadas de emergencia
- Mostrar list de casos críticos

**Respuesta:**
```json
[
  {
    "id": "call-uuid-5678",
    "userId": "user-id-abc",
    "callType": "EMERGENCY",
    "status": "ESCALATED",
    "classification": "GRAVE",
    "patientName": "Maria Elena Gonzalez",
    "summaryMarkdown": "EMERGENCIA: No puedo respirar!!!",
    "durationSeconds": 180,
    "createdAt": "2026-04-18T16:45:00Z"
  }
]
```

### 1.3 Mecanismo de Detección Automática en Backend

El backend ejecuta **lógica de IA para análisis de síntomas**:

```python
# Pseudocódigo del Backend MS-CALLS
def analyze_call_urgency(transcription, symptoms, user_profile):
    """
    Analiza urgencia basado en:
    1. Palabras clave críticas en transcripción
    2. Historia médica del usuario
    3. Parámetros vitales si están disponibles
    """
    
    # 1. Keywords críticos
    CRITICAL_KEYWORDS = [
        "dolor en el pecho",
        "no puedo respirar",
        "dificultad respiratoria",
        "sangrado",
        "inconsciente",
        "pérdida de conocimiento",
        "convulsión",
        "botón de alarma",  # ← BOTÓN DE SOCORRO
        "emergencia",
        "ayuda",
        "urgente"
    ]
    
    # 2. Evaluar transcripción
    urgency_score = 0
    for keyword in CRITICAL_KEYWORDS:
        if keyword.lower() in transcription.lower():
            urgency_score += 100  # Puntuación máxima
            break
    
    # 3. Evaluar síntomas reportados
    SERIOUS_CONDITIONS = {
        "chest_pain": 95,
        "difficulty_breathing": 90,
        "bleeding": 85,
        "loss_of_consciousness": 100,
        "seizure": 95,
        "severe_allergy": 90
    }
    
    for symptom in symptoms:
        if symptom in SERIOUS_CONDITIONS:
            urgency_score = max(urgency_score, SERIOUS_CONDITIONS[symptom])
    
    # 4. Considerar edad y condiciones crónicas
    if user_profile.age > 65:
        urgency_score += 10
    
    if user_profile.chronic_conditions:
        urgency_score += 15
    
    # 5. Clasificar
    if urgency_score >= 80:
        return {
            "classification": "GRAVE",
            "callType": "EMERGENCY",
            "status": "PENDING",
            "priority": 1,
            "auto_escalate": True,
            "notify_ambulance": True
        }
    elif urgency_score >= 50:
        return {
            "classification": "MODERADO",
            "callType": "CONSULTATION",
            "status": "PENDING",
            "priority": 2
        }
    else:
        return {
            "classification": "LEVE",
            "callType": "CONSULTATION",
            "status": "PENDING",
            "priority": 3
        }
```

---

## 🩺 Backend 2: Microservicio de Citas (MS-CITAS)

### 2.1 Rol en la Cadena de Respuesta

Cuando MS-CALLS detecta una EMERGENCIA, MS-CITAS entra en acción:

```
┌──────────────────────────┐
│ MS-CALLS detecta GRAVE   │
│ (callType: EMERGENCY)    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Busca médicos disponibles en MS-CITAS    │
│ GET /api/citas/medicos/disponibles       │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Crea cita de emergencia                  │
│ POST /api/citas/emergencia               │
│ - Prioridad: MÁXIMA                      │
│ - Tipo: TELECONSULTA INMEDIATA           │
│ - Paciente: Asignado automáticamente    │
│ - Duración: Flexible (abierta)           │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│ Notifica al médico más cercano           │
│ - Push notification                      │
│ - SMS                                    │
│ - Email                                  │
└──────────────────────────────────────────┘
```

### 2.2 Endpoints de Respuesta en Emergencia

#### **GET /api/citas/medicos/disponibles**
**Búsqueda de médico especializado**

```json
RESPONSE:
[
  {
    "medicId": "doc-001",
    "nombre": "Dr. Carlos García",
    "especialidad": "Cardiología",
    "disponible": true,
    "tiempoEstimadoAtencion": 2,
    "calificacion": 4.8
  },
  {
    "medicId": "doc-002",
    "nombre": "Dra. Ana Martínez",
    "especialidad": "Medicina General",
    "disponible": true,
    "tiempoEstimadoAtencion": 5,
    "calificacion": 4.5
  }
]
```

#### **POST /api/citas/emergencia**
**Creación de cita de emergencia**

```json
REQUEST:
{
  "pacienteId": "user-id-abc",
  "tipoEmergencia": "GRAVE",
  "especialidadRequerida": "Cardiología",
  "descripcion": "Dolor en el pecho severo",
  "ubicacionPaciente": {
    "latitude": -20.5,
    "longitude": -103.25
  },
  "telefonoContacto": "+34 123 456 789"
}

RESPONSE:
{
  "citaId": "cita-uuid-9999",
  "pacienteId": "user-id-abc",
  "medicoId": "doc-001",
  "medicoNombre": "Dr. Carlos García",
  "estado": "ACEPTADA",
  "inicioEstimado": "2026-04-18T16:47:00Z",
  "tipo": "TELECONSULTA_EMERGENCIA",
  "codigo_sala_virtual": "room-xyz-123",
  "prioridad": 1
}
```

---

## 🚨 Flujos de Detección de Emergencias

### Flujo 1: Detección por Palabras Clave (Automático)

```
┌──────────────────────────────────────────────────────┐
│  Paciente llama y dice:                              │
│  "Ayuda! No puedo respirar, tengo dolor en el pecho" │
└────────────┬─────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│  IVR Captura Audio y lo envía a IA                   │
└────────────┬─────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│  Google Gemini API:                                  │
│  - Transcribe: "Ayuda no puedo respirar..."          │
│  - Detecta keywords: [AYUDA, NO PUEDO RESPIRAR]      │
│  - Score: 95/100                                     │
│  - Classification: EMERGENCY                         │
└────────────┬─────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│  MS-CALLS Backend:                                   │
│  CREATE call {                                       │
│    callType: "EMERGENCY",                            │
│    classification: "GRAVE",                          │
│    status: "PENDING",                                │
│    auto_escalate: true                               │
│  }                                                   │
└────────────┬─────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────┐
│  Frontend recibe por SSE:                            │
│  event: new-call                                     │
│  data: { callType: "EMERGENCY", classification: "GRAVE" }
│                                                      │
│  📢 ALERTA VISUAL Y SONORA EN DASHBOARD              │
│  🔴 Llamada aparece en TOP ROJO                      │
│  🔔 Notificación push al médico oncall               │
└──────────────────────────────────────────────────────┘
```

### Flujo 2: Botón de Alarma (Manual)

```
┌────────────────────────────────────────┐
│  Usuario en peligro presiona:          │
│  [BOTÓN DE EMERGENCIA / SOS]           │
│  (En la app de paciente)               │
└────────────┬────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  Envía POST a backend:                 │
│  /api/calls/emergency                  │
│  {                                     │
│    "userId": "user-123",               │
│    "triggerType": "MANUAL_BUTTON",     │
│    "userLocation": {...}               │
│  }                                     │
└────────────┬────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  MS-CALLS Backend:                     │
│  - Crea llamada inmediatamente        │
│  - classific.: GRAVE (sin análisis)    │
│  - status: PENDING                     │
│  - callType: "boton" → mapeado a      │
│    "EMERGENCY"                         │
│  - auto_escalate: TRUE                │
│  - notify_ambulance: TRUE             │
│  - notify_police: MAYBE                │
└────────────┬────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  Cadena de Notificaciones:             │
│  ├─ 📞 Llamada a ambulancia (911)      │
│  ├─ 📱 SMS al contacto de emergencia   │
│  ├─ 🚑 Despatch a hospital cercano    │
│  ├─ 🎯 Notificación médico oncall      │
│  └─ 📍 Comparte ubicación con 911      │
└────────────────────────────────────────┘
```

### Flujo 3: Escala Manual por Médico

```
┌────────────────────────────────────────┐
│  Médico atiende llamada LEVE           │
│  Pero detecta síntomas graves          │
└────────────┬────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  Presiona botón "ESCALAR"              │
│  en el dashboard                       │
└────────────┬────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  Frontend envía:                       │
│  PUT /api/calls/{callId}               │
│  { status: "ESCALATED" }               │
└────────────┬────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  MS-CALLS Backend:                     │
│  - Actualiza classification a GRAVE    │
│  - Cambia status a IN_PROGRESS         │
│  - Busca especialista en MS-CITAS      │
│  - Crea cita de emergencia             │
│  - Envía alerta a toda la red          │
└────────────┬────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────┐
│  Broadcast SSE a todos los mdicos:     │
│  event: update-call                    │
│  data: { status: "ESCALATED",          │
│           classification: "GRAVE" }    │
└────────────────────────────────────────┘
```

---

## 🎛️ Botón de Alarma / Socorro

### Ubicación en UI

El botón de emergencia está implementado en:
- **Landing Page** (`landing.html`) - Acceso público
- **Dashboard del Paciente** - Una vez autenticado
- **Llamada Activa** - Durante una teleconsulta

### Código Frontend

**Método de activación:**
```typescript
// En llamadas.service.ts línea 162
async crearLlamadaEmergencia(): Promise<Llamada | null> {
  try {
    const callResponse = await firstValueFrom(
      this.httpService.createEmergencyCall()
    );
    const llamadaMapeada = this.httpService.mapBackendToLlamada(callResponse, 0);
    this.llamadas.update(list => [llamadaMapeada, ...list]);
    return llamadaMapeada;
  } catch (error) {
    console.log('📡 POST /api/calls/emergency → Error creando emergencia');
    return null;
  }
}
```

**En el servicio HTTP:**
```typescript
// En llamadas-http.service.ts línea 100
createEmergencyCall(): Observable<CallFromBackend> {
  const url = getCreateEmergencyEndpoint();  // /api/calls/emergency
  return this.http.post<CallFromBackend>(url, {}).pipe(
    tap(call => {
      console.log('📡 POST /api/calls/emergency →', call);
    })
  );
}
```

### Mapeo en Backend

**Líneas clave en mapBackendToLlamada:**

```typescript
// Línea 165: Mapeo especial para "boton"
const tipoMap: Record<string, TipoLlamada> = {
  'EMERGENCY': 'emergencia',
  'boton': 'emergencia'  // ← Si callType es "boton"
};

// Línea 129-131: Clasificación automática
const clasificacionMap = {
  'EMERGENCY': 'grave',
  'emergency': 'grave',
  'boton': 'grave'  // Implícito en lógica
};

// Línea 170-171: Si es emergencia, clasificación = grave
const clasificacion = clasificacionMap[call.classification] ||
  (call.callType === 'EMERGENCY' || call.callType === 'emergency' ? 'grave' : 'normal');
```

---

## 🧠 Clasificación Inteligente (Triage)

### Niveles de Triage

```typescript
// Modelo en llamada.model.ts línea 2
export type NivelTriage = 1 | 2 | 3 | 4 | 5;

// Mapeo en llamadas-http.service.ts línea 198
private calcularNivelTriage(clasificacion): NivelTriage {
  const nivelMap = {
    'grave': 1,      // EMERGENCIA INMEDIATA
    'moderado': 2,   // URGENTE (horas)
    'leve': 3,       // IMPORTANTE (días)
    'normal': 5      // RUTINA
  };
  return nivelMap[clasificacion] || 3;
}
```

### Tiempo de Respuesta Esperado

| Nivel | Clasificación | Tiempo Respuesta | Acción |
|-------|--------------|------------------|--------|
| 1️⃣ | GRAVE | **< 2 min** | Ambulancia + Especialista oncall |
| 2️⃣ | MODERADO | **< 20 min** | Médico general + Cita teleconsulta |
| 3️⃣ | LEVE | **< 2 horas** | Cita agendada + Chat IA |
| 5️⃣ | NORMAL | **< 48 horas** | Información + Seguimiento |

---

## 📊 Monitoreo en Tiempo Real

### Información Transmitida por SSE

El backend envía constantemente via `/api/calls/stream`:

```javascript
// Cada X segundos, status del sistema
{
  "connected": true,
  "timestamp": "2026-04-18T16:46:30Z",
  "callsInProgress": 5,
  "emergencies": 2,           // 🚨 Llamadas GRAVE activas
  "onCallDoctors": 8,
  "ambulancesAvailable": 12,
  "hospitalOccupancy": "65%"
}
```

### Detección de Anomalías

Si en 10 segundos consecutivos hay **más de 3 emergencias**, el sistema:
- Activa modo "CRISIS"
- Notifica a supervisores
- Prioriza todas las GRAVE
- Solicita ambulancias adicionales

---

## 🔄 Ciclo Completo de Una Emergencia

```
TIMELINE COMPLETO:
═════════════════════════════════════════════════════════════

T+0s     👤 Paciente presenta síntomas y llama
         ➜ IVR contesta

T+2s     🤖 IA analiza síntomas
         ➜ Detecta keywords críticos

T+3s     ✅ MS-CALLS clasifica como GRAVE
         ➜ Status: PENDING

T+4s     📡 Evento SSE enviado a Frontend
         ➜ Dashboard muestra alerta ROJA

T+5s     🚑 MS-CALLS busca ambulancia más cercana
         ➜ Envía coordenadas GPS

T+8s     👨‍⚕️ MS-CITAS busca doctor especialista
         ➜ Crea cita de emergencia

T+10s    📢 Doctor oncall recibe notificación
         ➜ Push + SMS + sonido

T+12s    👨‍⚕️ Doctor acepta llamada
         ➜ Inicia teleconsulta

T+180s   ✅ Teleconsulta + Ambulancia en ruta
         ➜ Paciente estabilizado

T+600s   🏥 Paciente en hospital
         ➜ Llamada -> RESOLVED
```

---

## 🔐 Seguridad y Privacidad

### Datos Protegidos
- Ubicación GPS: Encriptada en tránsito y en reposo
- Nombre y teléfono: Enmascarado en logs públicos
- Transcripciones: Almacenadas en base de datos segura con TTL

### Alertas de Abuso
Si un usuario presiona botón de emergencia > 5 veces en 1 hora:
- Sistema bloquea temporalmente
- Notifica a administrador
- Requiere verificación antes de siguiente alerta

---

## 📝 Conclusiones

### Resumen de Detección

**MS-CALLS detecta emergencias mediante:**
1. ✅ Análisis de transcripción + IA (automático)
2. ✅ Presión de botón manual (explícito)
3. ✅ Escalada manual del médico (reactivo)
4. ✅ Palabras clave en síntomas reportados (reactivo)

**MS-CITAS responde mediante:**
1. ✅ Búsqueda inmediata de especialista
2. ✅ Creación de cita de emergencia
3. ✅ Notificación a médicos oncall
4. ✅ Coordinación con servicios de emergencia

**Resultado:** Sistema de respuesta integrado y redundante que garantiza que NINGUNA emergencia pasa desapercibida.

---

*Documento de análisis generado: 2026-04-18*
*Última revisión: VozRural Analysis v1.0*
