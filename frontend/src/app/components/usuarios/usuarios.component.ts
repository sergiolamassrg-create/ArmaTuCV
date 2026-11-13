import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuarioServicio } from '../../services/usuario.servicio';
import { UsuarioListado } from '../../models/usuario';
@Component({ imports: [RouterLink], templateUrl: './usuarios.component.html' })
export class UsuariosComponent implements OnInit {
  private servicio = inject(UsuarioServicio);
  usuarios = signal<UsuarioListado[]>([]);
  error = signal('');
  ngOnInit() { this.cargar(); }
  cargar() { this.servicio.listar().subscribe({
    next: usuarios => this.usuarios.set(usuarios),
    error: () => this.error.set('No se pudo consultar a los usuarios.')
  }); }
}
