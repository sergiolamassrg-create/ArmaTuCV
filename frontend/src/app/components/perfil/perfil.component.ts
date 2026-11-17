import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PerfilServicio, DatosPerfil } from '../../services/perfil.servicio';
import { AccesoServicio } from '../../services/acceso.servicio';

@Component({
  imports: [ReactiveFormsModule],
  templateUrl: './perfil.component.html'
})

export class PerfilComponent {
  private fb = inject(FormBuilder);
  private servicio = inject(PerfilServicio);
  private acceso = inject(AccesoServicio);
  cargando = signal(false);
  guardando = signal(false);
  error = signal('');
  aviso = signal('');
  email = signal('');

  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    telefono: ['', Validators.maxLength(40)],
    ubicacion: ['', Validators.maxLength(200)],
    linkedin: ['', Validators.maxLength(250)],
    github: ['', Validators.maxLength(250)],
    portfolio: ['', Validators.maxLength(250)]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.obtener().subscribe({
      next: perfil => {
        this.formulario.patchValue(perfil);
        this.email.set(perfil.email);
        this.cargando.set(false);
      },
      error: error => {
        this.error.set(error.error?.mensaje || 'No se pudo cargar el perfil.');
        this.cargando.set(false);
      }
    });
  }

  guardar(): void {
    if (this.cargando() || this.guardando()) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      this.error.set('Revisá los campos del perfil.');
      return;
    }
    const datos: DatosPerfil = this.formulario.getRawValue();
    this.guardando.set(true);
    this.error.set('');
    this.aviso.set('');
    this.servicio.actualizar(datos).subscribe({
      next: perfil => {
        this.guardando.set(false);
        this.formulario.patchValue(perfil);
        this.aviso.set('Perfil guardado correctamente.');
        this.acceso.usuario.update(usuario => usuario ? {
          ...usuario, nombre: perfil.nombre, apellido: perfil.apellido
        } : usuario);
      },
      error: error => {
        this.guardando.set(false);
        this.error.set(error.error?.mensaje || 'No se pudo guardar el perfil.');
      }
    });
  }

}