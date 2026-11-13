import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurriculumServicio } from '../../services/curriculum.servicio';
import { ResumenCurriculum } from '../../models/curriculum';

@Component({
  imports: [RouterLink],
  templateUrl: './cv-listado.component.html'
})

export class CvListadoComponent implements OnInit {
  private servicio = inject(CurriculumServicio);
  cvs = signal<ResumenCurriculum[]>([]); error = signal(''); aviso = signal('');

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.servicio.listar().subscribe({
      next: datos => this.cvs.set(datos),
      error: () => this.error.set('No se pudieron consultar los CV.')
    });
  }

  eliminar(cv: ResumenCurriculum) {
    if (!confirm('¿Eliminar el CV ' + cv.titulo + '?')) return;
    this.servicio.eliminar(cv.id).subscribe({
      next: () => { this.cvs.update(lista => lista.filter(item => item.id !== cv.id)); this.aviso.set('CV eliminado.'); },
      error: () => this.error.set('No se pudo eliminar el CV.')
    });
  }
  
}