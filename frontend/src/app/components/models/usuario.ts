export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: 'usuario' | 'administrador';
    activo: boolean;
}
export interface UsuarioListado extends Usuario {
    cantidadCV: number;
    creadoEn: string | null;
    modificadoEn: string | null;
}
export interface DatosUsuario {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    rol: 'usuario' | 'administrador';
    activo: boolean;
}
export interface ResumenCV {
    id: number;
    titulo: string;
    creadoEn: string | null;
    modificadoEn: string | null;
}
