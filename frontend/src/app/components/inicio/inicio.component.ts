import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccesoServicio } from '../../services/acceso.servicio';

@Component({
  imports: [RouterLink],
  templateUrl: './inicio.component.html',
})
export class InicioComponent {
  acceso = inject(AccesoServicio);
}