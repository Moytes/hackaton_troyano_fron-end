export interface Paciente {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: Date;
  edad: number;
  genero: 'M' | 'F' | 'Otro';
  telefono: string;
  telefonoEmergencia: string;
  direccion: string;
  comunidad: string;
  tipoSangre: string;
  enfermedadesCronicas: string[];
  alergias: string[];
  medicamentos: string[];
  cirugias: string[];
  fechaRegistro: Date;
  ultimoContacto: Date;
  fotoUrl?: string;
}

export interface DatosClinicos {
  peso?: number;
  altura?: number;
  presionArterial?: string;
  frecuenciaCardiaca?: number;
  temperatura?: number;
  saturacionOxigeno?: number;
}