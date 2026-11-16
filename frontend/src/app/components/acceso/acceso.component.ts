import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccesoServicio } from '../../services/acceso.servicio';
import { Observable } from 'rxjs';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './acceso.component.html'
})

export class AccesoComponent {
  acceso = inject(AccesoServicio);
  private ruta = inject(ActivatedRoute);
  private navegador = inject(Router);
  private fb = inject(FormBuilder);
  registro = this.ruta.snapshot.data['registro'] === true;
  error = signal('');
  pendiente = signal(false);
  formulario = this.fb.nonNullable.group({
    nombre: [''],
    apellido: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    repetirClave: ['']
  });

  enviar(): void {
    if (this.pendiente()) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      this.error.set('Completá correo y contraseña.');
      return;
    }
    const datos = this.formulario.getRawValue();
    if (this.registro) {
      if (!datos.nombre.trim() || !datos.apellido.trim()) {
        this.error.set('Completá nombre y apellido.');
        return;
      }
      if (datos.password.length < 12 || datos.password.length > 128 || datos.password !== datos.repetirClave) {
        this.error.set('La contraseña debe tener entre 12 y 128 caracteres y coincidir con la repetición.');
        return;
      }
    }
    this.pendiente.set(true);
    this.error.set('');
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
          let destino = this.ruta.snapshot.queryParamMap.get('returnUrl') || '/curriculums';
          const permitido = destino === '/curriculums' || destino.startsWith('/curriculums/') ||
            destino === '/perfil' || destino === '/fotos' ||
            destino === '/usuarios' || destino.startsWith('/usuarios/');
          if (!permitido) destino = '/curriculums';
          this.navegador.navigateByUrl(destino);
        }
      },
      error: error => {
        this.pendiente.set(false);
        this.error.set(this.acceso.mensaje(error));
        // No borrar los datos al fallar para que el usuario pueda corregirlos.
      }
    });
  }

}