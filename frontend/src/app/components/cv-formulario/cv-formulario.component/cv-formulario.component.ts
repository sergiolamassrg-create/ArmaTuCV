import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CurriculumServicio } from '../../services/curriculum.servicio';
import { DatosCurriculum, nuevoCV } from '../../models/curriculum';

@Component({
imports: [FormsModule, RouterLink],
templateUrl: './cv-formulario.component.html'
})

export class CvFormularioComponent {
  private servicio = inject(CurriculumServicio); 
  private navegador = inject(Router);
  datos: DatosCurriculum = nuevoCV(); 
  error = signal('');
  
  guardar(formulario: NgForm) {
    if (formulario.invalid) return;
    this.servicio.crear(this.datos).subscribe({
      next: cv => this.navegador.navigate(['/curriculums',cv.id]),
      error: error => this.error.set(this.servicio.mensaje(error))
    });
  }
  
}