import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Perfil {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  ubicacion: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface DatosPerfil {
  nombre: string;
  apellido: string;
  telefono: string;
  ubicacion: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilServicio {
  private http = inject(HttpClient);
  obtener() {
    return this.http.get<Perfil>('/api/perfil');
  }
  actualizar(datos: DatosPerfil) {
    return this.http.put<Perfil>('/api/perfil', datos);
  }
}