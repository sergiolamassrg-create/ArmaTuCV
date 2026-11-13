import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurriculumServicio } from '../../services/curriculum.servicio';
import { DatosCurriculum, Curriculum, nuevoCV } from '../../models/curriculum';

@Component({ 
imports: [FormsModule, RouterLink],
templateUrl: './cv-formulario.component.html' 
})

export class CvFormularioComponent implements OnInit {
  private servicio = inject(CurriculumServicio);
  private ruta = inject(ActivatedRoute); private navegador = inject(Router);
  id = this.ruta.snapshot.paramMap.get('id');
  datos: DatosCurriculum = nuevoCV(); error = signal('');
  
  ngOnInit() {
    if (this.id) this.cargar(); 
  }
  
  cargar() {
    if (!this.id) return;
    this.servicio.obtener(this.id).subscribe({
      next: cv => this.adaptar(cv),
      error: error => this.error.set(this.servicio.mensaje(error))
    });
  }

  adaptar(cv: Curriculum) {
    this.datos = {
      titulo: cv.titulo, puesto: cv.puesto, resumen: cv.resumen,
      experiencias: cv.experiencias, educaciones: cv.educaciones, habilidades: cv.habilidades,
      idiomas: cv.idiomas, complementos: cv.complementos, fotoId: cv.fotoId,
      plantilla: cv.plantilla, tamanoLetra: cv.tamanoLetra, mostrarIconos: cv.mostrarIconos
    };
  }

  guardar(formulario: NgForm) {
    if (formulario.invalid) return;
    const accion = this.id ? this.servicio.actualizar(this.id, this.datos) : this.servicio.crear(this.datos);
    accion.subscribe({
      next: cv => this.navegador.navigate(['/curriculums', cv.id]),
      error: error => this.error.set(this.servicio.mensaje(error))
    });
  }
}