import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AccesoServicio } from './acceso.servicio';

export const revisarSesion: HttpInterceptorFn = (solicitud, siguiente) => {
    const servicio = inject(AccesoServicio);
    const navegador = inject(Router);
    return siguiente(solicitud).pipe(
        catchError(error => {
            if ((solicitud.url.startsWith('/api/curriculums') || solicitud.url.startsWith('/api/usuarios') || solicitud.url.startsWith('/api/fotos')) && error instanceof HttpErrorResponse && error.status === 401) {
                servicio.olvidar();
                servicio.aviso.set('La sesión venció. Volvé a ingresar.');
                navegador.navigate(['/acceso']);
            }
            return throwError(() => error);
        })
    );
};
