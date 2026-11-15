import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccesoServicio } from '../services/acceso.servicio';
import { Observable } from 'rxjs';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './acceso.component.html'
})
export class AccesoComponent {
  acceso = inject(AccesoServicio);
  private ruta = inject(ActivatedRoute);
  private navegador = inject(Router);
  private constructorFormulario = inject(FormBuilder);
  registro = this.ruta.snapshot.data['registro'] === true;
  error = signal('');
  pendiente = signal(false);

  formulario = this.constructorFormulario.nonNullable.group({
    nombre: [''], apellido: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    repetirClave: ['']
  });

  enviar(): void {
    if (this.pendiente()) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) { this.error.set('Completá el correo y la contraseña.'); return; }
    const datos = this.formulario.getRawValue();
    if (this.registro) {
      if (!datos.nombre.trim() || !datos.apellido.trim()) {
        this.error.set('Completá nombre y apellido.'); return;
      }
      if (datos.password.length < 12 || datos.password !== datos.repetirClave) {
        this.error.set('La contraseña debe tener al menos 12 caracteres y coincidir en ambos campos.'); return;
      }
    }
    this.error.set('');
    this.pendiente.set(true);
    const peticion: Observable<unknown> = this.registro
      ? this.acceso.registrar(datos.nombre, datos.apellido, datos.email, datos.password)
      : this.acceso.ingresar(datos.email, datos.password);
    peticion.subscribe({
      next: () => {
        this.pendiente.set(false);
        this.formulario.reset({ nombre: '', apellido: '', email: '', password: '', repetirClave: '' });
        if (this.registro) {
          this.acceso.aviso.set('Cuenta creada. Ahora ingresá con tu correo y contraseña.');
          this.navegador.navigate(['/acceso']);
        } else {
          this.navegador.navigate(['/curriculums']);
        }
      },
      error: error => {
        this.error.set(this.acceso.mensaje(error));
        this.pendiente.set(false);
      }
    });
  }
}
