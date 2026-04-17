import { Paciente } from '../models/paciente.model';
import { Llamada } from '../models/llamada.model';
import { Mensaje } from '../models/mensaje.model';
import { Cita, Doctor } from '../models/cita.model';
import { Alerta, Agente } from '../models/alerta.model';

export const PACIENTES_MOCK: Paciente[] = [
  {
    id: 'p1',
    nombre: 'Juan',
    apellidoPaterno: 'Pérez',
    apellidoMaterno: 'García',
    fechaNacimiento: new Date('1952-05-15'),
    edad: 72,
    genero: 'M',
    telefono: '4421234567',
    telefonoEmergencia: '4429876543',
    direccion: 'Calle Principal, San José el揽',
    comunidad: 'San José el揽',
    tipoSangre: 'O+',
    enfermedadesCronicas: ['Diabetes Tipo 2', 'Hipertensión arterial'],
    alergias: ['Penicilina'],
    medicamentos: ['Metformina 500mg', 'Losartán 50mg'],
    cirugias: ['Apendicectomía (1998)'],
    fechaRegistro: new Date('2024-01-15'),
    ultimoContacto: new Date('2025-04-10')
  },
  {
    id: 'p2',
    nombre: 'María',
    apellidoPaterno: 'García',
    apellidoMaterno: 'López',
    fechaNacimiento: new Date('1958-08-20'),
    edad: 66,
    genero: 'F',
    telefono: '4422345678',
    telefonoEmergencia: '4428765432',
    direccion: 'Calle Juárez, Pinal de Amoles',
    comunidad: 'Pinal de Amoles',
    tipoSangre: 'A+',
    enfermedadesCronicas: ['Artritis reumatoide'],
    alergias: [],
    medicamentos: ['Celebrex 200mg', 'Acetaminofén'],
    cirugias: [],
    fechaRegistro: new Date('2024-02-20'),
    ultimoContacto: new Date('2025-04-08')
  },
  {
    id: 'p3',
    nombre: 'José',
    apellidoPaterno: 'Martínez',
    apellidoMaterno: 'Hernández',
    fechaNacimiento: new Date('1948-12-01'),
    edad: 76,
    genero: 'M',
    telefono: '4423456789',
    telefonoEmergencia: '4427654321',
    direccion: 'Callealleros,Concá',
    comunidad: 'Concá',
    tipoSangre: 'B+',
    enfermedadesCronicas: ['Insuficiencia cardíaca', 'EPOC'],
    alergias: ['Sulfa', 'Aspirina'],
    medicamentos: ['Furosemida 40mg', 'Digoxina 0.25mg', 'Salbutamol'],
    cirugias: ['Bypass coronario (2010)'],
    fechaRegistro: new Date('2024-01-10'),
    ultimoContacto: new Date('2025-04-12')
  },
  {
    id: 'p4',
    nombre: 'Ana',
    apellidoPaterno: 'Rodríguez',
    apellidoMaterno: 'Sánchez',
    fechaNacimiento: new Date('1965-03-10'),
    edad: 59,
    genero: 'F',
    telefono: '4424567890',
    telefonoEmergencia: '4426543210',
    direccion: 'Calle Eldorado, Ezequiel Montes',
    comunidad: 'Ezequiel Montes',
    tipoSangre: 'AB-',
    enfermedadesCronicas: [],
    alergias: ['Polen', 'Ácaros'],
    medicamentos: ['Loratadina 10mg'],
    cirugias: [],
    fechaRegistro: new Date('2024-03-05'),
    ultimoContacto: new Date('2025-04-05')
  },
  {
    id: 'p5',
    nombre: 'Pedro',
    apellidoPaterno: 'González',
    apellidoMaterno: 'Torres',
    fechaNacimiento: new Date('1950-07-22'),
    edad: 74,
    genero: 'M',
    telefono: '4425678901',
    telefonoEmergencia: '4425432109',
    direccion: 'Calle Llanitos, Amealco',
    comunidad: 'Amealco',
    tipoSangre: 'A-',
    enfermedadesCronicas: ['Diabetes Tipo 2', 'Retinopatía diabética'],
    alergias: [],
    medicamentos: ['Glucomet', 'Insulina NPH'],
    cirugias: ['Cirugía de retina (2020)'],
    fechaRegistro: new Date('2024-02-01'),
    ultimoContacto: new Date('2025-04-11')
  }
];

export const LLAMADAS_MOCK: Llamada[] = [
  {
    id: 'll1',
    pacienteId: 'p1',
    pacienteNombre: 'Juan Pérez García',
    clasificacion: 'grave',
    nivelTriage: 2,
    estado: 'en_proceso',
    tipo: 'emergencia',
    sintomasIniciales: ['Dolor en el pecho', 'Falta de aire'],
    descripcion: 'Me duele mucho el pecho y no puedo respirar bien. Tengo 72 años y tengo diabetes.',
    duracion: 180,
    resumenIA: 'Paciente masculino de 72 años con dolor torácico opresivo y disnea. Historia de diabetes e hipertensión. Síntomas started hace 2 horas. Clasificado como EMERGENCIA - requiere atención inmediata.',
    horaInicio: new Date('2025-04-16T10:30:00'),
    agenteId: 'ia1'
  },
  {
    id: 'll2',
    pacienteId: 'p2',
    pacienteNombre: 'María García López',
    clasificacion: 'moderado',
    nivelTriage: 3,
    estado: 'entrante',
    tipo: 'consulta',
    sintomasIniciales: ['Dolor articular', 'Inflamación'],
    descripcion: 'Me duelen las articulaciones de las manos y están hinchadas. Ya no puedo ni agarrar cosas.',
    horaInicio: new Date('2025-04-16T11:00:00')
  },
  {
    id: 'll3',
    pacienteId: 'p3',
    pacienteNombre: 'José Martínez Hernández',
    clasificacion: 'grave',
    nivelTriage: 1,
    estado: 'escalada',
    tipo: 'emergencia',
    sintomasIniciales: ['Dificultad respiratoria', 'Color azulado en labios'],
    descripcion: 'No puedo respirar bien, me estoy ahogando. Tengo enfermedad del corazón.',
    duracion: 90,
    resumenIA: 'Paciente masculino de 76 años con disnea severa y cianosis. Historia de insuficiencia cardíaca y EPOC. CLASIFICADO COMO CRÍTICO - requiere envío inmediato de emergencia.',
    horaInicio: new Date('2025-04-16T09:15:00'),
    horaEscalada: new Date('2025-04-16T09:30:00'),
    agenteEspecializado: 'cardio'
  },
  {
    id: 'll4',
    pacienteId: 'p4',
    pacienteNombre: 'Ana Rodríguez Sánchez',
    clasificacion: 'leve',
    nivelTriage: 4,
    estado: 'resuelta',
    tipo: 'consulta',
    sintomasIniciales: ['Estornudos', 'Congestión nasal'],
    descripcion: 'Tengo alergias, estornudosconstantemente y la nariz tapada.',
    duracion: 300,
    resumenIA: 'Síntomas alérgicos típicos. Sin signos de alarma. Recomendación: continuar antihistamínicos y evitar alergenos.',
    horaInicio: new Date('2025-04-15T16:00:00'),
    horaFin: new Date('2025-04-15T16:05:00')
  },
  {
    id: 'll5',
    pacienteId: 'p5',
    pacienteNombre: 'Pedro González Torres',
    clasificacion: 'normal',
    nivelTriage: 5,
    estado: 'entrante',
    tipo: 'seguimiento',
    sintomasIniciales: [],
    descripcion: 'Quiero saber si ya puedo ir a consulta con el retinólogo.',
    horaInicio: new Date('2025-04-16T11:30:00')
  }
];

export const MENSAJES_MOCK: Mensaje[] = [
  {
    id: 'm1',
    llamadaId: 'll1',
    remitente: 'ia',
    contenido: 'Buenos días, Juan. Soy su asistente de salud. ¿En qué puedo ayudarle hoy?',
    timestamp: new Date('2025-04-16T10:30:00')
  },
  {
    id: 'm2',
    llamadaId: 'll1',
    remitente: 'paciente',
    contenido: 'Me duele mucho el pecho y no puedo respirar bien.',
    timestamp: new Date('2025-04-16T10:30:30')
  },
  {
    id: 'm3',
    llamadaId: 'll1',
    remitente: 'ia',
    contenido: 'Entiendo. ¿Podría describir el dolor? ¿Es un dolor punzante u opresivo? ¿Desde cuándo lo tiene?',
    timestamp: new Date('2025-04-16T10:31:00')
  },
  {
    id: 'm4',
    llamadaId: 'll1',
    remitente: 'paciente',
    contenido: 'Es como una presión, como que me apachurran. Ya tengo como 2 horas con esto.',
    timestamp: new Date('2025-04-16T10:32:00')
  },
  {
    id: 'm5',
    llamadaId: 'll1',
    remitente: 'ia',
    contenido: 'Gracias. ¿Tiene diabetes o presión alta? ¿Ya took sus medicamentos hoy?',
    timestamp: new Date('2025-04-16T10:33:00')
  },
  {
    id: 'm6',
    llamadaId: 'll1',
    remitente: 'paciente',
    contenido: 'Sí, tengo diabetes y presión alta. Ya tomé mis pastillas esta mañana.',
    timestamp: new Date('2025-04-16T10:34:00')
  }
];

export const DOCTORES_MOCK: Doctor[] = [
  {
    id: 'd1',
    nombre: 'Dr. Roberto García Mendoza',
    especialidad: 'Nutriología',
    cedula: '12345678',
    telefono: '4421112233',
    email: 'dr.garcia@salud.siglo.gob.mx',
    disponibilidad: [
      { dia: 1, horaInicio: '09:00', horaFin: '17:00' },
      { dia: 2, horaInicio: '09:00', horaFin: '17:00' },
      { dia: 3, horaInicio: '09:00', horaFin: '17:00' },
      { dia: 4, horaInicio: '09:00', horaFin: '17:00' },
      { dia: 5, horaInicio: '09:00', horaFin: '14:00' }
    ]
  },
  {
    id: 'd2',
    nombre: 'Dra. Carmen López Fernández',
    especialidad: 'Pediatría',
    cedula: '87654321',
    telefono: '4422223344',
    email: 'dra.lopez@salud.siglo.gob.mx',
    disponibilidad: [
      { dia: 1, horaInicio: '08:00', horaFin: '16:00' },
      { dia: 2, horaInicio: '08:00', horaFin: '16:00' },
      { dia: 3, horaInicio: '08:00', horaFin: '16:00' },
      { dia: 4, horaInicio: '08:00', horaFin: '16:00' }
    ]
  },
  {
    id: 'd3',
    nombre: 'Dr. Alejandro Reyes Torres',
    especialidad: 'Cardiología',
    cedula: '11223344',
    telefono: '4423334455',
    email: 'dr.reyes@salud.siglo.gob.mx',
    disponibilidad: [
      { dia: 1, horaInicio: '10:00', horaFin: '18:00' },
      { dia: 2, horaInicio: '10:00', horaFin: '18:00' },
      { dia: 3, horaInicio: '10:00', horaFin: '18:00' },
      { dia: 4, horaInicio: '10:00', horaFin: '18:00' },
      { dia: 5, horaInicio: '10:00', horaFin: '16:00' }
    ]
  }
];

export const CITAS_MOCK: Cita[] = [
  {
    id: 'c1',
    pacienteId: 'p2',
    pacienteNombre: 'María García López',
    doctorId: 'd1',
    doctorNombre: 'Dr. Roberto García Mendoza',
    especialidad: 'Nutriología',
    fecha: new Date('2025-04-18T10:00:00'),
    duracion: 30,
    estado: 'confirmada',
    recordatorioEnviado: true
  },
  {
    id: 'c2',
    pacienteId: 'p1',
    pacienteNombre: 'Juan Pérez García',
    doctorId: 'd3',
    doctorNombre: 'Dr. Alejandro Reyes Torres',
    especialidad: 'Cardiología',
    fecha: new Date('2025-04-20T11:00:00'),
    duracion: 45,
    estado: 'agendada',
    recordatorioEnviado: false
  }
];

export const ALERTAS_MOCK: Alerta[] = [
  {
    id: 'a1',
    tipo: 'emergencia',
    prioridad: 'alta',
    titulo: 'Emergencia detectada',
    mensaje: 'Paciente José Martínez Hernández requiere atención inmediata. Clasificación: Grave.',
    pacienteId: 'p3',
    pacienteNombre: 'José Martínez Hernández',
    relacionadaId: 'll3',
    relacionadaTipo: 'llamada',
    leida: false,
    fechaCreacion: new Date('2025-04-16T09:30:00')
  },
  {
    id: 'a2',
    tipo: 'sintomas',
    prioridad: 'media',
    titulo: 'Síntomas recurrentes',
    mensaje: 'María García López ha reportado síntomas articulares 3 veces este mes.',
    pacienteId: 'p2',
    pacienteNombre: 'María García López',
    leida: false,
    fechaCreacion: new Date('2025-04-16T08:00:00')
  },
  {
    id: 'a3',
    tipo: 'recordatorio',
    prioridad: 'baja',
    titulo: 'Chequeo preventivo vencido',
    mensaje: 'Juan Pérez García tiene su chequeo mensual vencido. Última visita: hace 35 días.',
    pacienteId: 'p1',
    pacienteNombre: 'Juan Pérez García',
    leida: true,
    fechaLectura: new Date('2025-04-14T10:00:00'),
    fechaCreacion: new Date('2025-04-13T09:00:00')
  },
  {
    id: 'a4',
    tipo: 'cita',
    prioridad: 'media',
    titulo: 'Cita mañana',
    mensaje: 'Cita con el Dr. Roberto García Mendoza mañana a las 10:00 AM.',
    pacienteId: 'p2',
    pacienteNombre: 'María García López',
    relacionadaId: 'c1',
    relacionadaTipo: 'cita',
    leida: true,
    fechaLectura: new Date('2025-04-15T10:00:00'),
    fechaCreacion: new Date('2025-04-15T10:00:00')
  }
];

export const AGENTES_MOCK: Agente[] = [
  {
    id: 'ag1',
    tipo: 'general',
    nombre: 'IA Asistente',
    descripcion: 'Asistente médico general para consultas y emergencias',
    especialdad: 'Medicina general',
    activo: true,
    icono: 'pi pi-user'
  },
  {
    id: 'ag2',
    tipo: 'nutriologo',
    nombre: 'Asesor Nutricional',
    descripcion: 'Especialista en nutrición y alimentación saludable',
    especialdad: 'Nutriología',
    activo: true,
    icono: 'pi pi-apple'
  },
  {
    id: 'ag3',
    tipo: 'pediatra',
    nombre: 'Asesor Pediátrico',
    descripcion: 'Especialista en salud infantil',
    especialdad: 'Pediatría',
    activo: true,
    icono: 'pi pi-heart'
  },
  {
    id: 'ag4',
    tipo: 'cardiologo',
    nombre: 'Asesor Cardíaco',
    descripcion: 'Especialista en salud cardiovascular',
    especialdad: 'Cardiología',
    activo: true,
    icono: 'pi pi-bolt'
  },
  {
    id: 'ag5',
    tipo: 'geriatra',
    nombre: 'Asesor Geriátrico',
    descripcion: 'Especialista en adultos mayores',
    especialdad: 'Geriatría',
    activo: false,
    icono: 'pi pi-users'
  }
];