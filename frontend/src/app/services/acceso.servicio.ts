import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, of, tap, throwError } from 'rxjs';
import { Usuario } from '../models/usuario';
export interface Mensaje { mensaje: string; }
@Injectable({ providedIn: 'root' })
export class AccesoServicio {
    private clienteHttp = inject(HttpClient);
    usuario = signal<Usuario | null | undefined>(undefined);
    aviso = signal('');
    comprobar() {
        if (this.usuario() !== undefined) return of(this.usuario());
        return this.clienteHttp.get<Usuario | null>('/api/auth/sesion').pipe(
            tap(usuario => this.usuario.set(usuario)),
            catchError(error => {
                if (error.status === 401) { this.usuario.set(null); return of(null); }
                return throwError(() => error);
            })
        );
    }
    ingresar(correo: string, clave: string) {
        return this.clienteHttp.post<Usuario>('/api/auth/ingreso', { email: correo, password: clave }).pipe(
            tap(usuario => { this.usuario.set(usuario); this.aviso.set(''); })
        );
    }
    registrar(nombre: string, apellido: string, correo: string, clave: string) {
        return this.clienteHttp.post<Mensaje>('/api/auth/registro', { nombre, apellido, email: correo, password: clave });
    }
    salir() {
        return this.clienteHttp.post<Mensaje>('/api/auth/salida', {}).pipe(
            tap(respuesta => { this.usuario.set(null); this.aviso.set(respuesta.mensaje); })
        );
    }
    olvidar() { this.usuario.set(null); }
    mensaje(error: HttpErrorResponse) {
        if (error.error && error.error.mensaje) return error.error.mensaje;
        return 'No se pudo conectar con el servidor. Intentá nuevamente.';
    }
}
