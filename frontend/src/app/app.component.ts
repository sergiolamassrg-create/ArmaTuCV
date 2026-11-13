import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AccesoServicio } from './components/services/acceso.servicio';
@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  acceso = inject(AccesoServicio);
  private router = inject(Router);
  error = signal('');
  salir() {
    this.acceso.salir().subscribe({
      next: () => this.router.navigate(['/acceso']),
      error: (e) => this.error.set(this.acceso.mensaje(e)),
    });
  }
}
