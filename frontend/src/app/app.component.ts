import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccesoServicio } from './services/acceso.servicio';
import { PiePaginaComponent } from './components/pie-pagina/pie-pagina.component';
import { CabeceraComponent } from './components/cabecera/cabecera.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CabeceraComponent, PiePaginaComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  acceso = inject(AccesoServicio);
  error = signal('');

  ngOnInit(): void {
    this.acceso.comprobar().subscribe({
      error: () => this.error.set('No se pudo comprobar la sesión.'),
    });
  }
}