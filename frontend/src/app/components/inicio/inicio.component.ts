import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AccesoServicio } from '../../services/acceso.servicio';

@Component({
  imports: [RouterLink],
  templateUrl: './inicio.component.html'
})
export class InicioComponent implements OnInit {
  acceso = inject(AccesoServicio);
  ngOnInit() {
    // La portada permanece pública aunque el servicio de sesión no esté disponible.
    this.acceso.comprobar().subscribe({ error: () => this.acceso.olvidar() });
  }
}
