import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AccesoServicio } from './acceso.servicio';

// El backend vuelve a comprobar la sesión y los permisos en cada petición.
export const controlarAcceso: CanActivateFn = (ruta, estado) => {
    const servicio = inject(AccesoServicio);
    const navegador = inject(Router);
    const ingreso = navegador.createUrlTree(['/acceso'], { queryParams: { returnUrl: estado.url } });

    return servicio.comprobar().pipe(
        map(usuario => {
            if (!usuario) return ingreso;
            if (ruta.data['soloAdministrador'] && usuario.rol !== 'administrador') {
                return navegador.createUrlTree(['/curriculums']);
            }
            return true;
        }),
        catchError(error => {
            servicio.aviso.set(servicio.mensaje(error));
            return of(ingreso);
        })
    );
};
