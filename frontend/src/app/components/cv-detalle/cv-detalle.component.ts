import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurriculumServicio } from '../../services/curriculum.servicio';
import { Curriculum } from '../../models/curriculum';
import { AccesoServicio } from '../../services/acceso.servicio';

@Component({
  imports: [RouterLink],
  templateUrl: './cv-detalle.component.html',
  styleUrl: './cv-detalle.component.css',
})
export class CvDetalleComponent {
  private servicio = inject(CurriculumServicio);
  private ruta = inject(ActivatedRoute);
  private acceso = inject(AccesoServicio);
  cv = signal<Curriculum | null>(null);
  error = signal('');
  esPropietario = computed(() => this.cv()?.usuarioId === this.acceso.usuario()?.id);
  volverA = computed(() => (this.esPropietario() ? '/curriculums' : '/usuarios'));
  textoVolver = computed(() =>
    this.esPropietario() ? 'Volver a mis currículums' : 'Volver a usuarios',
  );
  ngOnInit() {
    this.cargar();
  }
  cargar() {
    const id = this.ruta.snapshot.paramMap.get('id');
    if (!id) return;
    this.servicio.obtener(id).subscribe({
      next: (cv) => this.cv.set(cv),
      error: () => this.error.set('No se pudo cargar el currículum.'),
    });
  }
  imprimir() {
    window.print();
  }
}
