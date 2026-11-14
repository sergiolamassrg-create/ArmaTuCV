import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuarioServicio } from '../../services/usuario.servicio';
import { ResumenCV, UsuarioListado } from '../../models/usuario';
@Component({ imports: [RouterLink], templateUrl: './usuarios.component.html' })
export class UsuariosComponent implements OnInit {
  private servicio = inject(UsuarioServicio);
  usuarios = signal<UsuarioListado[]>([]);
  error = signal(''); aviso = signal('');
  seleccionado = signal<UsuarioListado | null>(null);
  curriculums = signal<ResumenCV[]>([]);
  total = computed(() => this.usuarios().length);
  ngOnInit() { this.cargar(); }
  cargar() { this.error.set(''); this.servicio.listar().subscribe({
    next: datos => this.usuarios.set(datos), error: () => this.error.set('No se pudo consultar usuarios.')
  }); }
  desactivar(usuario: UsuarioListado) {
    if (!confirm('¿Desactivar a ' + usuario.nombre + '?')) return;
    this.servicio.desactivar(usuario.id).subscribe({
      next: () => { this.aviso.set('Usuario desactivado.'); this.cargar(); },
      error: () => this.error.set('No se pudo desactivar la cuenta.')
    });
  }
  verCurriculums(usuario: UsuarioListado) {
    this.seleccionado.set(usuario);
    this.servicio.curriculums(usuario.id).subscribe({
      next: datos => this.curriculums.set(datos), error: () => this.error.set('No se pudieron consultar los CV.')
    });
  }
}
