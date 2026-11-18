export interface Experiencia {
  puesto: string;
  empresa: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  descripcion: string;
}

export interface Educacion {
  titulo: string;
  institucion: string;
  anioInicio: number | null;
  anioFin: number | null;
  estado: string;
}

export interface Habilidad {
  nombre: string;
  tipo: 'TECNICA' | 'BLANDA';
}

export interface Idioma {
  idioma: string;
  nivel: string;
}

export interface Complemento {
  tipo: 'CURSO' | 'CERTIFICACION' | 'PROYECTO';
  titulo: string;
  descripcion: string;
  anio: number | null;
}

export interface DatosCurriculum {
  titulo: string;
  puesto: string;
  resumen: string;
  experiencias: Experiencia[];
  educaciones: Educacion[];
  habilidades: Habilidad[];
  idiomas: Idioma[];
  complementos: Complemento[];
  tamanoLetra: number;
  mostrarIconos: boolean;
}

export interface Curriculum extends DatosCurriculum {
  id: number;
  usuarioId: number;
  nombreCompleto: string;
  email?: string;
  telefono?: string;
  ubicacion?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface ResumenCurriculum {
  id: number;
  titulo: string;
  nombreCompleto: string;
}
