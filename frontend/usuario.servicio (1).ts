import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioServicio } from '../../services/usuario.servicio';
import { AccesoServicio } from '../services/acceso.servicio';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-formulario.component.html'
})
export class UsuarioFormularioComponent {
  private servicio = inject(UsuarioServicio);
  private acceso = inject(AccesoServicio);
  private ruta = inject(ActivatedRoute);
  private navegador = inject(Router);
  private constructorFormulario = inject(FormBuilder);

  id = this.ruta.snapshot.paramMap.get('id');
  error = signal('');
  cargando = signal(false);
  guardando = signal(false);

  formulario = this.constructorFormulario.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    rol: ['usuario' as 'usuario' | 'administrador', Validators.required],
    activo: [true],
    password: ['', [Validators.minLength(12), Validators.maxLength(128)]],
    repetirClave: ['']
  });

  ngOnInit(): void {
    if (this.id) {
      this.cargando.set(true);
      this.servicio.obtener(this.id).subscribe({
        next: usuario => {
          this.formulario.patchValue({
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            rol: usuario.rol,
            activo: usuario.activo,
            password: '',
            repetirClave: ''
          });
          this.cargando.set(false);
        },
        error: error => {
          this.error.set(this.acceso.mensaje(error));
          this.cargando.set(false);
        }
      });
    }
  }

  guardar(): void {
    this.formulario.markAllAsTouched();
    if (this.cargando() || this.guardando() || this.formulario.invalid) {
      this.error.set('Revisá los datos obligatorios.');
      return;
    }

    const datos = this.formulario.getRawValue();
    if (!this.id && !datos.password) {
      this.error.set('Ingresá una contraseña de al menos 12 caracteres.');
      return;
    }
    if (datos.password !== datos.repetirClave) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    const usuario = {
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: datos.email.trim(),
      rol: datos.rol,
      activo: datos.activo,
      password: datos.password
    };
    this.error.set('');
    this.guardando.set(true);
    const peticion = this.id
      ? this.servicio.actualizar(this.id, usuario)
      : this.servicio.crear(usuario);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.formulario.reset({ nombre: '', apellido: '', email: '', rol: 'usuario', activo: true, password: '', repetirClave: '' });
        this.navegador.navigate(['/usuarios']);
      },
      error: error => {
        this.error.set(this.acceso.mensaje(error));
        this.guardando.set(false);
      }
    });
  }
}
