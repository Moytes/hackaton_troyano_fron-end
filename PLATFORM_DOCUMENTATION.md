# 🏥 Plataforma de Teleasistencia Médica - Hackaton Troyano

## 📝 Descripción General
La plataforma de **Teleasistencia Médica** es una solución web de vanguardia diseñada para la gestión eficiente de emergencias, consultas y seguimiento de pacientes en tiempo real. Desarrollada con las últimas tecnologías del ecosistema Angular, la aplicación permite una interacción fluida entre administradores, doctores y personal de soporte, optimizando la respuesta médica ante situaciones críticas.

---

## 🚀 Características Principales

### 📡 1. Monitoreo de Llamadas en Tiempo Real (SSE)
Implementación de un sistema de **Server-Sent Events (SSE)** que permite la recepción instantánea de alertas de emergencia y llamadas entrantes desde el microservicio de llamadas.
- **Clasificación Automática:** Las llamadas se categorizan por nivel de urgencia (Grave, Moderado, Leve).
- **Actualización Reactiva:** Interfaz alimentada por Angular Signals para una respuesta visual inmediata sin recargas.

### 🤖 2. Asistente de IA (Google Gemini)
Integración con la API de **Google Generative AI** para proporcionar asistencia inteligente a los profesionales de la salud.
- **Chat Interactivo:** Resolución de dudas clínicas y protocolos de actuación.
- **Análisis de Datos:** Procesamiento de información para apoyo en la toma de decisiones.

### 👥 3. Gestión Multi-Rol
Sistema robusto de autenticación y autorización con tres perfiles definidos:
- **Administrador:** Gestión global del sistema y visualización de métricas.
- **Doctor:** Acceso a su agenda de citas, historial de pacientes y consultas activas.
- **Superadmin:** Control total de la infraestructura y configuración de usuarios.

### 📅 4. Gestión de Citas y Pacientes
Módulo completo para la organización de la atención médica:
- **Agenda Médica:** Calendario interactivo para la programación de consultas.
- **Expediente Digital:** Acceso rápido a la información crítica del paciente.

### 🔔 5. Sistema de Alertas Dinámicas
Notificaciones push y visuales para eventos críticos, asegurando que ninguna emergencia pase desapercibida.

---

## 🛠️ Arquitectura Técnica

### Tecnologías Core
- **Angular 19:** Framework principal utilizando las últimas funcionalidades como *Signals* y *Standalone Components*.
- **PrimeNG 19:** Biblioteca de componentes de UI de nivel empresarial para una estética profesional y funcional.
- **RxJS:** Gestión de flujos de datos asíncronos complejos.
- **Google Generative AI SDK:** Integración directa con modelos LLM.

### Infraestructura y Rendimiento
- **PWA (Progressive Web App):** Soporte para instalación en dispositivos y funcionamiento offline mediante Service Workers.
- **SSR (Server-Side Rendering):** Optimización para motores de búsqueda y tiempos de carga inicial ultra-rápidos.
- **Vite Integration:** Pipeline de construcción moderno y rápido.

---

## 📂 Estructura del Proyecto

```text
src/app/
├── auth/               # Lógica de autenticación y login
├── Components/         # Componentes reutilizables (Header, Sidebar, Footer)
├── Core/               # Interceptores e interfaces globales
├── guards/             # Protecciones de rutas (authGuard, roles)
├── models/             # Definiciones de tipos y modelos de datos (Llamada, Usuario, Alerta)
├── Pages/              # Vistas principales de la aplicación
│   ├── dashboard/      # Panel principal administrativo
│   ├── doctor-dashboard/ # Panel especializado para médicos
│   ├── llamadas/       # Vista de monitoreo en tiempo real
│   └── chat-ia/        # Interfaz de asistente inteligente
├── services/           # Servicios de lógica de negocio y consumo de APIs
└── config/             # Configuraciones globales y de endpoints
```

---

## 🔐 Implementación de Seguridad

### Autenticación
La plataforma utiliza un servicio de autenticación (`AuthService`) que gestiona el estado de la sesión mediante **Signals**, persistiendo de forma segura la información necesaria en el almacenamiento local y protegiendo las rutas críticas mediante `guards`.

### Configuración de API
Toda la comunicación con el backend se centraliza en `api.config.ts`, permitiendo una fácil transición entre entornos (desarrollo, producción) mediante variables de entorno de Vite.

---

## 💻 Desarrollo y Despliegue

### Scripts Disponibles
- `npm start`: Inicia el servidor de desarrollo.
- `npm run build`: Genera el bundle de producción optimizado.
- `npm run test`: Ejecuta la suite de pruebas unitarias con Karma.

### Requisitos del Sistema
- **Node.js:** Versión 20 o superior.
- **Angular CLI:** Versión 19.

---

## 🌟 Visión de Diseño
La interfaz ha sido diseñada siguiendo principios de **diseño limpio y accesibilidad**, utilizando una paleta de colores profesional (Azul Médico, Blanco Clínico y Gris Neutro) que facilita la lectura de datos críticos en situaciones de alta presión.

---
*Documentación generada el 18 de abril de 2026 para el equipo de desarrollo de Hackaton Troyano.*
