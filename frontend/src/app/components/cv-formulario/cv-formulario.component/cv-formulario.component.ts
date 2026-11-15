import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurriculumServicio } from '../../services/curriculum.servicio';
import {
  Curriculum, DatosCurriculum, Experiencia, Educacion, Habilidad, Idioma,
  Complemento, nuevoCV
} from '../../models/curriculum';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cv-formulario.component.html'
})
export class CvFormularioComponent {
  private servicio = inject(CurriculumServicio);
  private ruta = inject(ActivatedRoute);
  private navegador = inject(Router);
  private constructorFormulario = inject(FormBuilder);
  id = this.ruta.snapshot.paramMap.get('id');
  error = signal('');
  cargando = signal(false);
  guardando = signal(false);
  datos: DatosCurriculum = nuevoCV();

  formulario = this.constructorFormulario.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    puesto: ['', [Validators.required, Validators.maxLength(180)]],
    resumen: ['', Validators.maxLength(2000)]
  });

  ngOnInit(): void {
    if (!this.id) return;
    this.cargando.set(true);
    this.servicio.obtener(this.id).subscribe({
      next: cv => { this.cargarDatos(cv); this.cargando.set(false); },
      error: error => { this.error.set(this.servicio.mensaje(error)); this.cargando.set(false); }
    });
  }

  cargarDatos(cv: Curriculum): void {
    this.formulario.patchValue({ titulo: cv.titulo, puesto: cv.puesto, resumen: cv.resumen });
    this.datos = {
      titulo: cv.titulo, puesto: cv.puesto, resumen: cv.resumen,
      experiencias: [...cv.experiencias], educaciones: [...cv.educaciones],
      habilidades: [...cv.habilidades], idiomas: [...cv.idiomas],
      complementos: [...cv.complementos], fotoId: cv.fotoId,
      plantilla: cv.plantilla, tamanoLetra: cv.tamanoLetra, mostrarIconos: cv.mostrarIconos
    };
  }

  agregarExperiencia(): void {
    this.datos.experiencias.push({ puesto: '', empresa: '', fechaInicio: null, fechaFin: null, descripcion: '' });
  }
  agregarEducacion(): void {
    this.datos.educaciones.push({ titulo: '', institucion: '', anioInicio: null, anioFin: null, estado: '' });
  }
  agregarHabilidad(): void {
    this.datos.habilidades.push({ nombre: '', tipo: 'TECNICA' });
  }
  agregarIdioma(): void {
    this.datos.idiomas.push({ idioma: '', nivel: '' });
  }
  agregarComplemento(): void {
    this.datos.complementos.push({ tipo: 'CURSO', titulo: '', descripcion: '', anio: null });
  }
  cambiarTipoHabilidad(habilidad: Habilidad, tipo: string): void {
    habilidad.tipo = tipo === 'BLANDA' ? 'BLANDA' : 'TECNICA';
  }
  cambiarTipoComplemento(complemento: Complemento, tipo: string): void {
    complemento.tipo = tipo === 'PROYECTO' ? 'PROYECTO' : tipo === 'CERTIFICACION' ? 'CERTIFICACION' : 'CURSO';
  }

  guardar(): void {
    this.formulario.markAllAsTouched();
    if (this.cargando() || this.guardando() || this.formulario.invalid) {
      this.error.set('Completá el título y el puesto objetivo.');
      return;
    }
    const campos = this.formulario.getRawValue();
    const datos: DatosCurriculum = {
      ...this.datos,
      titulo: campos.titulo.trim(),
      puesto: campos.puesto.trim(),
      resumen: campos.resumen.trim()
    };
    if (!datos.titulo || !datos.puesto) {
      this.error.set('Completá el título y el puesto objetivo.');
      return;
    }
    this.error.set('');
    this.guardando.set(true);
    const peticion = this.id ? this.servicio.actualizar(this.id, datos) : this.servicio.crear(datos);
    peticion.subscribe({
      next: cv => {
        this.guardando.set(false);
        if (!this.id) {
          this.formulario.reset({ titulo: '', puesto: '', resumen: '' });
          this.datos = nuevoCV();
        }
        this.navegador.navigate(['/curriculums', cv.id]);
      },
      error: error => {
        this.error.set(this.servicio.mensaje(error));
        this.guardando.set(false);
      }
    });
  }
}
