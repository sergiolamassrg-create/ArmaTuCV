import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioServicio } from '../../services/usuario.servicio';
import { DatosUsuario } from '../../models/usuario';
@Component({ imports: [FormsModule, RouterLink], templateUrl: './usuario-formulario.component.html' })
export class UsuarioFormularioComponent {
  private servicio = inject(UsuarioServicio);
  private navegador = inject(Router);
  datos: DatosUsuario = { nombre: '', apellido: '', email: '', password: '', rol: 'usuario', activo: true };
  error = signal('');
  guardar(formulario: NgForm) {
    if (formulario.invalid) return;
    this.servicio.crear(this.datos).subscribe({
      next: () => this.navegador.navigate(['/usuarios']),
      error: () => this.error.set('No se pudo crear la cuenta.')
    });
  }
}
