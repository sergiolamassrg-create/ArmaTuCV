import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurriculumServicio } from '../services/curriculum.servicio';
import { Curriculum, DatosCurriculum } from '../models/curriculum';
import { FotosComponent } from '../fotos/fotos.component';
import { Foto } from '../../models/foto';

@Component({
  imports: [RouterLink, FotosComponent],
  templateUrl: './cv-detalle.component.html',
})
export class CvDetalleComponent implements OnInit {
  private servicio = inject(CurriculumServicio);
  private ruta = inject(ActivatedRoute);

  cv = signal<Curriculum | null>(null);

  error = signal('');

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

  seleccionarFoto(foto: Foto | null) {
    const cv = this.cv();
    if (!cv) return;

    const datos: DatosCurriculum = {
      titulo: cv.titulo,
      puesto: cv.puesto,
      resumen: cv.resumen,
      experiencias: cv.experiencias,
      educaciones: cv.educaciones,
      habilidades: cv.habilidades,
      idiomas: cv.idiomas,
      complementos: cv.complementos,
      fotoId: foto?.id ?? null,
      plantilla: foto ? 'con-foto' : 'sin-foto',
      tamanoLetra: cv.tamanoLetra,
      mostrarIconos: cv.mostrarIconos,
    };

    this.servicio.actualizar(String(cv.id), datos).subscribe({
      next: () => this.cargar(),
      error: (error) => this.error.set(this.servicio.mensaje(error)),
    });
  }
}
