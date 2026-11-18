import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioServicio } from '../../services/usuario.servicio';
import { DatosUsuario } from '../../models/usuario';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './usuario-formulario.component.html',
})
export class UsuarioFormularioComponent {
  private servicio = inject(UsuarioServicio);
  private ruta = inject(ActivatedRoute);
  private navegador = inject(Router);
  private fb = inject(FormBuilder);

  id = this.ruta.snapshot.paramMap.get('id');
  error = signal('');
  cargando = signal(false);
  guardando = signal(false);

  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    rol: ['usuario' as 'usuario' | 'administrador', Validators.required],
    activo: [true],
    password: [''],
    cambiarClave: [false],
  });

  ngOnInit(): void {
    this.configurarValidacionClave();
    this.formulario.controls.cambiarClave.valueChanges.subscribe(() => {
      this.formulario.controls.password.reset('');
      this.configurarValidacionClave();
    });
    if (!this.id) return;
    this.cargando.set(true);
    this.servicio.obtener(this.id).subscribe({
      next: (usuario) => {
        this.formulario.patchValue({
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol,
          activo: usuario.activo,
          password: '',
        });
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la cuenta.');
        this.cargando.set(false);
      },
    });
  }

  guardar(): void {
    if (this.cargando() || this.guardando()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Revisá los campos indicados de la cuenta.');
      return;
    }
    const valores = this.formulario.getRawValue();
    const nuevaClave = valores.password;
    if ((!this.id || valores.cambiarClave) && !nuevaClave.trim()) {
      this.error.set('La contraseña no puede contener solamente espacios.');
      return;
    }
    const datos: DatosUsuario = {
      nombre: valores.nombre.trim(),
      apellido: valores.apellido.trim(),
      email: valores.email.trim(),
      rol: valores.rol,
      activo: valores.activo,
      password: !this.id || valores.cambiarClave ? nuevaClave : '',
    };
    this.error.set('');
    this.guardando.set(true);
    const peticion = this.id
      ? this.servicio.actualizar(this.id, datos)
      : this.servicio.crear(datos);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.formulario.reset({
          nombre: '',
          apellido: '',
          email: '',
          rol: 'usuario',
          activo: true,
          password: '',
          cambiarClave: false,
        });
        this.navegador.navigate(['/usuarios']);
      },
      error: (error) => {
        this.guardando.set(false);
        this.error.set(error.error?.mensaje || 'No se pudo guardar la cuenta.');
        // Conservar nombre, apellido y correo para corregir el error.
        // La clave sólo se usa si el usuario seleccionó cambiarla.
      },
    });
  }

  configurarValidacionClave(): void {
    const clave = this.formulario.controls.password;
    if (!this.id || this.formulario.controls.cambiarClave.value) {
      clave.setValidators([
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(128),
      ]);
    } else {
      clave.clearValidators();
    }
    clave.updateValueAndValidity();
  }
}
