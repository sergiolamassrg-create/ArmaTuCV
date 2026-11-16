import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurriculumServicio } from '../../services/curriculum.servicio';
import { ResumenCurriculum } from '../../models/curriculum';

@Component({ imports: [RouterLink], templateUrl: './cv-listado.component.html' })
export class CvListadoComponent {
  private servicio = inject(CurriculumServicio);
  cvs = signal<ResumenCurriculum[]>([]);
  error = signal('');
  aviso = signal('');
  ngOnInit(): void { this.cargar(); }
  cargar(): void {
    this.servicio.listar().subscribe({
      next: lista => this.cvs.set(lista),
      error: error => this.error.set(this.servicio.mensaje(error))
    });
  }
  eliminar(cv: ResumenCurriculum): void {
    if (!confirm('¿Eliminar ' + cv.titulo + '?')) return;
    this.servicio.eliminar(cv.id).subscribe({
      next: () => { this.cvs.update(lista => lista.filter(item => item.id !== cv.id)); this.aviso.set('CV eliminado.'); },
      error: error => this.error.set(this.servicio.mensaje(error))
    });
  }
}
