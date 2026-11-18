import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pie-pagina',
  imports: [RouterLink],
  templateUrl: './pie-pagina.component.html',
})
export class PiePaginaComponent {
  anio = new Date().getFullYear();
}