import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioServicio } from '../../services/usuario.servicio';
import { DatosUsuario } from '../../models/usuario';
@Component({ imports: [FormsModule, RouterLink], templateUrl: './usuario-formulario.component.html' })
export class UsuarioFormularioComponent implements OnInit {
  private servicio = inject(UsuarioServicio);
  private ruta = inject(ActivatedRoute);
  private navegador = inject(Router);
  id = this.ruta.snapshot.paramMap.get('id');
  datos: DatosUsuario = { nombre: '', apellido: '', email: '', password: '', rol: 'usuario', activo: true };
  error = signal('');
  ngOnInit() {
    if (!this.id) return;
    this.servicio.obtener(this.id).subscribe({
      next: u => this.datos = { nombre: u.nombre, apellido: u.apellido, email: u.email,
        password: '', rol: u.rol, activo: u.activo },
      error: () => this.error.set('No se pudo cargar la cuenta.')
    });
  }
  guardar(formulario: NgForm) {
    if (formulario.invalid) return;
    const accion = this.id ? this.servicio.actualizar(this.id,this.datos) : this.servicio.crear(this.datos);
    accion.subscribe({ next: () => this.navegador.navigate(['/usuarios']),
      error: () => this.error.set('No se pudo guardar la cuenta.') });
  }
}
