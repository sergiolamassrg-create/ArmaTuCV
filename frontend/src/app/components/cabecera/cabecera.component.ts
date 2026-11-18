import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccesoServicio } from '../../services/acceso.servicio';

@Component({
  selector: 'app-cabecera',
  imports: [RouterLink],
  templateUrl: './cabecera.component.html',
})
export class CabeceraComponent {
  acceso = inject(AccesoServicio);
  private navegador = inject(Router);
  saliendo = signal(false);
  error = signal('');

  salir(): void {
    if (this.saliendo()) return;
    this.saliendo.set(true);
    this.error.set('');
    this.acceso.salir().subscribe({
      next: () => {
        this.saliendo.set(false);
        this.navegador.navigate(['/']);
      },
      error: (error) => {
        this.saliendo.set(false);
        this.error.set(this.acceso.mensaje(error));
      },
    });
  }
}