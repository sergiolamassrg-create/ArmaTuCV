import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuarioServicio } from '../../services/usuario.servicio';
import { ResumenCV, UsuarioListado } from '../../models/usuario';

@Component({ imports: [RouterLink], templateUrl: './usuarios.component.html' })
export class UsuariosComponent {
  private servicio = inject(UsuarioServicio);
  usuarios = signal<UsuarioListado[]>([]);
  error = signal('');
  aviso = signal('');
  seleccionado = signal<UsuarioListado | null>(null);
  curriculums = signal<ResumenCV[]>([]);
  cargando = signal(false);
  datosCargados = signal(false);
  total = computed(() => this.usuarios().length);
  activos = computed(() => this.usuarios().filter((usuario) => usuario.activo).length);
  desactivados = computed(() => this.total() - this.activos());
  totalCurriculums = computed(() =>
    this.usuarios().reduce((cantidad, usuario) => cantidad + usuario.cantidadCV, 0),
  );

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.datosCargados.set(false);
    this.error.set('');
    this.seleccionado.set(null);
    this.curriculums.set([]);
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.usuarios.set(datos);
        this.datosCargados.set(true);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudieron consultar los usuarios. Intentá actualizar nuevamente.');
      },
    });
  }

  desactivar(usuario: UsuarioListado) {
    if (
      !confirm(
        '¿Desactivar al usuario ' +
          usuario.nombre +
          ' ' +
          usuario.apellido +
          '? Sus currículums se conservarán.',
      )
    )
      return;
    this.servicio.desactivar(usuario.id).subscribe({
      next: () => {
        this.aviso.set('Usuario desactivado.');
        this.cargar();
      },
      error: () => this.error.set('No se pudo desactivar la cuenta.'),
    });
  }

  verCurriculums(usuario: UsuarioListado) {
    this.seleccionado.set(usuario);
    this.servicio.curriculums(usuario.id).subscribe({
      next: (datos) => this.curriculums.set(datos),
      error: () => this.error.set('No se pudieron consultar los CV.'),
    });
  }
}