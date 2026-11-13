import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AccesoServicio } from '../../services/acceso.servicio';
@Component({ imports: [FormsModule, RouterLink], templateUrl: './acceso.component.html' })
export class AccesoComponent {
  private servicio = inject(AccesoServicio); private navegador = inject(Router);
  correo = ''; clave = ''; error = signal('');
  ingresar(formulario: NgForm) { if (formulario.invalid) return;
    this.servicio.ingresar(this.correo,this.clave).subscribe({
      next: () => this.navegador.navigate(['/curriculums']),
      error: error => this.error.set(this.servicio.mensaje(error))
    });
  }
}
