export interface Foto {
  id: number;
  nombre: string;
  foto: string;
  bytes: number;
  enUso: number;
  creadoEn: string;
  reutilizada?: boolean;
}
