import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AccesoServicio } from '../../services/acceso.servicio';
@Component({ imports: [FormsModule, RouterLink], templateUrl: './acceso.component.html' })
export class AccesoComponent {
    acceso = inject(AccesoServicio);
    private navegador = inject(Router);
    private rutaActual = inject(ActivatedRoute);
    registro = this.rutaActual.snapshot.data['registro'] === true;
    nombre = '';
    apellido = '';
    correo = '';
    clave = '';
    repetirClave = '';
    pendiente = signal(false);
    error = signal('');
    enviar(formulario: NgForm) {
        if (this.pendiente()) return;
        formulario.control.markAllAsTouched();
        if (formulario.invalid || (this.registro && (!this.nombre.trim() || !this.apellido.trim()))) {
            this.error.set('Completá los campos obligatorios.'); return;
        }
        if (this.registro && this.clave !== this.repetirClave) {
            this.error.set('Las contraseñas no coinciden.'); return;
        }
        this.pendiente.set(true);
        this.error.set('');
        const peticion: Observable<unknown> = this.registro
            ? this.acceso.registrar(this.nombre, this.apellido, this.correo, this.clave)
            : this.acceso.ingresar(this.correo, this.clave);
        this.clave = '';
        this.repetirClave = '';
        peticion.subscribe({
            next: () => {
                this.pendiente.set(false);
                if (this.registro) {
                    this.acceso.aviso.set('Cuenta creada. Ingresá con tu correo y contraseña.');
                    this.navegador.navigate(['/acceso']);
                } else {
                    let destino = this.rutaActual.snapshot.queryParamMap.get('returnUrl') || '/curriculums';
                    const destinoPermitido = destino === '/curriculums' || destino.startsWith('/curriculums/') ||
                        destino === '/usuarios' || destino.startsWith('/usuarios/');
                    if (!destinoPermitido) destino = '/curriculums';
                    this.navegador.navigateByUrl(destino);
                }
            },
            error: error => { this.pendiente.set(false); this.error.set(this.acceso.mensaje(error)); }
        });
    }
}
