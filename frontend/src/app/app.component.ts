import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AccesoServicio } from './services/acceso.servicio';
import { PiePaginaComponent } from './components/pie-pagina/pie-pagina.component';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet, PiePaginaComponent],
  templateUrl: './app.component.html'
})

export class AppComponent {
  acceso = inject(AccesoServicio);
  private router = inject(Router);
  error = signal('');

  ngOnInit(): void {
    this.acceso.comprobar().subscribe({
      error: () => this.error.set('No se pudo comprobar la sesión.')
    });
  }

  salir(): void {
    this.acceso.salir().subscribe({
      next: () => this.router.navigate(['/acceso']),
      error: error => this.error.set(this.acceso.mensaje(error))
    });
  }

}