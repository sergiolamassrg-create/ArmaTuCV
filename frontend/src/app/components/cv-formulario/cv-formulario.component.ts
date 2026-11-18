import { Component, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurriculumServicio } from '../../services/curriculum.servicio';
import {
  Curriculum,
  DatosCurriculum,
  Experiencia,
  Educacion,
  Habilidad,
  Idioma,
  Complemento,
} from '../../models/curriculum';
import { fechaValida, fechasOrdenadas, aniosOrdenados } from './cv-formulario.validadores';
import { AccesoServicio } from '../../services/acceso.servicio';

type FormularioExperiencia = FormGroup<{
  puesto: FormControl<string>;
  empresa: FormControl<string>;
  fechaInicio: FormControl<string | null>;
  fechaFin: FormControl<string | null>;
  descripcion: FormControl<string>;
}>;

type FormularioEducacion = FormGroup<{
  titulo: FormControl<string>;
  institucion: FormControl<string>;
  anioInicio: FormControl<number | null>;
  anioFin: FormControl<number | null>;
  estado: FormControl<string>;
}>;

type FormularioHabilidad = FormGroup<{
  nombre: FormControl<string>;
  tipo: FormControl<Habilidad['tipo']>;
}>;

type FormularioIdioma = FormGroup<{
  idioma: FormControl<string>;
  nivel: FormControl<string>;
}>;

type FormularioComplemento = FormGroup<{
  tipo: FormControl<Complemento['tipo']>;
  titulo: FormControl<string>;
  descripcion: FormControl<string>;
  anio: FormControl<number | null>;
}>;

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cv-formulario.component.html',
})
export class CvFormularioComponent {
  private servicio = inject(CurriculumServicio);
  private ruta = inject(ActivatedRoute);
  private navegador = inject(Router);
  private acceso = inject(AccesoServicio);
  private constructorFormulario = inject(FormBuilder);
  id = this.ruta.snapshot.paramMap.get('id');
  error = signal('');
  cargando = signal(false);
  guardando = signal(false);
  falloCarga = signal(false);

  formulario = this.constructorFormulario.nonNullable.group({
    titulo: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)]],
    puesto: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(180)]],
    resumen: ['', Validators.maxLength(2000)],
    experiencias: new FormArray<FormularioExperiencia>([], Validators.maxLength(20)),
    educaciones: new FormArray<FormularioEducacion>([], Validators.maxLength(20)),
    habilidades: new FormArray<FormularioHabilidad>([], Validators.maxLength(20)),
    idiomas: new FormArray<FormularioIdioma>([], Validators.maxLength(20)),
    complementos: new FormArray<FormularioComplemento>([], Validators.maxLength(20)),
    tamanoLetra: [11],
    mostrarIconos: [false],
  });

  get experiencias() {
    return this.formulario.controls.experiencias;
  }

  get educaciones() {
    return this.formulario.controls.educaciones;
  }

  get habilidades() {
    return this.formulario.controls.habilidades;
  }

  get idiomas() {
    return this.formulario.controls.idiomas;
  }

  get complementos() {
    return this.formulario.controls.complementos;
  }

  ngOnInit(): void {
    if (!this.id) return;
    this.cargando.set(true);
    this.servicio.obtener(this.id).subscribe({
      next: (cv) => {
        if (cv.usuarioId !== this.acceso.usuario()?.id) {
          this.error.set('Solo el propietario puede editar este currículum.');
          this.cargando.set(false);
          this.falloCarga.set(true);
          return;
        }
        this.cargarDatos(cv);
        this.cargando.set(false);
      },
      error: (error) => {
        this.error.set(this.servicio.mensaje(error));
        this.cargando.set(false);
        this.falloCarga.set(true);
      },
    });
  }

  cargarDatos(cv: Curriculum): void {
    this.experiencias.clear();
    this.educaciones.clear();
    this.habilidades.clear();
    this.idiomas.clear();
    this.complementos.clear();
    this.formulario.patchValue({
      titulo: cv.titulo,
      puesto: cv.puesto,
      resumen: cv.resumen,
      tamanoLetra: cv.tamanoLetra,
      mostrarIconos: cv.mostrarIconos,
    });
    for (const registro of cv.experiencias) this.agregarExperiencia(registro);
    for (const registro of cv.educaciones) this.agregarEducacion(registro);
    for (const registro of cv.habilidades) this.agregarHabilidad(registro);
    for (const registro of cv.idiomas) this.agregarIdioma(registro);
    for (const registro of cv.complementos) this.agregarComplemento(registro);
    this.formulario.markAsPristine();
    this.formulario.markAsUntouched();
  }

  agregarExperiencia(datos?: Experiencia): void {
    if (!datos && this.experiencias.length >= 20) return;
    this.experiencias.push(
      this.constructorFormulario.nonNullable.group(
        {
          puesto: [
            datos?.puesto ?? '',
            [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)],
          ],
          empresa: [
            datos?.empresa ?? '',
            [Validators.required, Validators.pattern(/\S/), Validators.maxLength(150)],
          ],
          fechaInicio: new FormControl<string | null>(datos?.fechaInicio ?? null, fechaValida),
          fechaFin: new FormControl<string | null>(datos?.fechaFin ?? null, fechaValida),
          descripcion: [datos?.descripcion ?? '', Validators.maxLength(2000)],
        },
        { validators: fechasOrdenadas },
      ),
    );
  }

  agregarEducacion(datos?: Educacion): void {
    if (!datos && this.educaciones.length >= 20) return;
    this.educaciones.push(
      this.constructorFormulario.nonNullable.group(
        {
          titulo: [
            datos?.titulo ?? '',
            [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)],
          ],
          institucion: [
            datos?.institucion ?? '',
            [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)],
          ],
          anioInicio: new FormControl<number | null>(datos?.anioInicio ?? null, [
            Validators.min(1900),
            Validators.max(2100),
          ]),
          anioFin: new FormControl<number | null>(datos?.anioFin ?? null, [
            Validators.min(1900),
            Validators.max(2100),
          ]),
          estado: [datos?.estado ?? '', Validators.maxLength(40)],
        },
        { validators: aniosOrdenados },
      ),
    );
  }

  agregarHabilidad(datos?: Habilidad): void {
    if (!datos && this.habilidades.length >= 20) return;
    this.habilidades.push(
      this.constructorFormulario.nonNullable.group({
        nombre: [
          datos?.nombre ?? '',
          [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)],
        ],
        tipo: this.constructorFormulario.nonNullable.control<Habilidad['tipo']>(
          datos?.tipo ?? 'TECNICA',
          Validators.required,
        ),
      }),
    );
  }

  agregarIdioma(datos?: Idioma): void {
    if (!datos && this.idiomas.length >= 20) return;
    this.idiomas.push(
      this.constructorFormulario.nonNullable.group({
        idioma: [
          datos?.idioma ?? '',
          [Validators.required, Validators.pattern(/\S/), Validators.maxLength(80)],
        ],
        nivel: [
          datos?.nivel ?? '',
          [Validators.required, Validators.pattern(/\S/), Validators.maxLength(60)],
        ],
      }),
    );
  }

  agregarComplemento(datos?: Complemento): void {
    if (!datos && this.complementos.length >= 20) return;
    this.complementos.push(
      this.constructorFormulario.nonNullable.group({
        tipo: this.constructorFormulario.nonNullable.control<Complemento['tipo']>(
          datos?.tipo ?? 'CURSO',
          Validators.required,
        ),
        titulo: [
          datos?.titulo ?? '',
          [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)],
        ],
        descripcion: [datos?.descripcion ?? '', Validators.maxLength(2000)],
        anio: new FormControl<number | null>(datos?.anio ?? null, [
          Validators.min(1900),
          Validators.max(2100),
        ]),
      }),
    );
  }

  quitar(lista: FormArray, indice: number): void {
    lista.removeAt(indice);
    this.formulario.markAsDirty();
  }

  guardar(): void {
    if (this.cargando() || this.guardando() || this.falloCarga()) return;
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.error.set('Revisá los campos indicados. Completá los registros agregados o quitalos.');
      return;
    }
    const datos: DatosCurriculum = this.formulario.getRawValue();
    datos.titulo = datos.titulo.trim();
    datos.puesto = datos.puesto.trim();
    datos.resumen = datos.resumen.trim();
    datos.experiencias = datos.experiencias.map((experiencia) => ({
      ...experiencia,
      fechaInicio: experiencia.fechaInicio || null,
      fechaFin: experiencia.fechaFin || null,
    }));
    this.error.set('');
    this.guardando.set(true);
    const peticion = this.id
      ? this.servicio.actualizar(this.id, datos)
      : this.servicio.crear(datos);
    peticion.subscribe({
      next: (cv) => {
        this.guardando.set(false);
        this.navegador.navigate(['/curriculums', cv.id]);
      },
      error: (error) => {
        this.error.set(this.servicio.mensaje(error));
        this.guardando.set(false);
      },
    });
  }
}
