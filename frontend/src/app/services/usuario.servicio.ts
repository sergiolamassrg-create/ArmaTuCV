import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatosUsuario, ResumenCV, Usuario, UsuarioListado } from '../models/usuario';
@Injectable({ providedIn: 'root' })
export class UsuarioServicio {
    private clienteHttp = inject(HttpClient);
    private direccion = '/api/usuarios';
    listar() { return this.clienteHttp.get<UsuarioListado[]>(this.direccion); }
    obtener(id: string) { return this.clienteHttp.get<Usuario>(this.direccion + '/' + id); }
    crear(datos: DatosUsuario) { return this.clienteHttp.post<Usuario>(this.direccion, datos); }
    actualizar(id: string, datos: DatosUsuario) { return this.clienteHttp.put<Usuario>(this.direccion + '/' + id, datos); }
    desactivar(id: number) { return this.clienteHttp.delete<{mensaje: string}>(this.direccion + '/' + id); }
    curriculums(id: number) { return this.clienteHttp.get<ResumenCV[]>(this.direccion + '/' + id + '/curriculums'); }
}
