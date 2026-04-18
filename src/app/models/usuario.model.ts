export type Rol = 'superadmin' | 'doctor' | 'admin';

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  email: string;
  especialidad: string;
  rol: Rol;
  fotoUrl?: string;
  fechaRegistro: Date;
  ultimoAcceso: Date;
  activo: boolean;
}

export interface Credenciales {
  username: string;
  password: string;
}