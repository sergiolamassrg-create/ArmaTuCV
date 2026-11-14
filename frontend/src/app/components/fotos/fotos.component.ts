import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FotoServicio } from '../../services/foto.servicio';
import { CurriculumServicio } from '../services/curriculum.servicio';
import { Foto } from '../../models/foto';

@Component({ selector: 'app-fotos', templateUrl: './fotos.component.html' })
export class FotosComponent implements OnInit {
  private servicio = inject(FotoServicio);
  private mensajes = inject(CurriculumServicio);

  @Input() seleccion: number | null = null;
  @Input() bloqueado = false;
  @Output() elegir = new EventEmitter<Foto | null>();
  @Output() ocupado = new EventEmitter<boolean>();
  fotos = signal<Foto[]>([]);
  error = signal('');
  pendiente = signal(false);
  aviso = signal('');

  ngOnInit() {
    this.cargar();
  }

  cargar(limpiarError = true) {
    if (limpiarError) this.error.set('');
    this.aviso.set('');
    this.servicio.listar().subscribe({
      next: (fotos) => this.fotos.set(fotos),
      error: (error) => this.error.set(this.mensajes.mensaje(error)),
    });
  }

  async subir(evento: Event) {
    const entrada = evento.target as HTMLInputElement;
    const archivos = Array.from(entrada.files ?? []);
    if (!archivos.length) return;

    if (archivos.length > 5 - this.fotos().length) {
      this.error.set(
        'Podés cargar ' + (5 - this.fotos().length) + ' fotos más. Elegí menos archivos.',
      );
      entrada.value = '';
      return;
    }

    this.pendiente.set(true);
    this.ocupado.emit(true);
    this.error.set('');
    this.aviso.set('');
    let ultima: Foto | null = null;

    try {
      for (const archivo of archivos) {
        const imagen = await this.servicio.prepararFoto(archivo);
        ultima = await firstValueFrom(this.servicio.subir(archivo.name.slice(0, 100), imagen));
        this.fotos.update((fotos) => [ultima!, ...fotos.filter((f) => f.id !== ultima!.id)]);
      }
      this.aviso.set(
        'Fotos disponibles en tu biblioteca. La última quedó seleccionada; guardá el diseño para vincularla al CV.',
      );
    } catch (error: unknown) {
      const mensaje =
        error && typeof error === 'object' && 'error' in error
          ? this.mensajes.mensaje(error as import('@angular/common/http').HttpErrorResponse)
          : error instanceof Error
            ? error.message
            : 'No se pudo cargar la foto.';
      this.error.set(mensaje + ' Las fotos que ya se cargaron se conservan.');
    } finally {
      entrada.value = '';
      this.pendiente.set(false);
      this.ocupado.emit(false);
      if (ultima) this.elegir.emit(ultima);
    }
  }

  eliminar(foto: Foto) {
    if (this.bloqueado || this.pendiente() || !confirm('¿Eliminar esta foto de tu biblioteca?'))
      return;

    this.pendiente.set(true);
    this.ocupado.emit(true);
    this.error.set('');
    this.servicio.eliminar(foto.id).subscribe({
      next: () => {
        this.fotos.update((fotos) => fotos.filter((f) => f.id !== foto.id));
        this.pendiente.set(false);
        this.ocupado.emit(false);
        if (this.seleccion === foto.id) this.elegir.emit(null);
        this.aviso.set('Foto eliminada. Ahora tenés un lugar disponible.');
      },

      error: (error) => {
        this.error.set(this.mensajes.mensaje(error));
        this.pendiente.set(false);
        this.ocupado.emit(false);
        this.cargar(false);
      },
    });
  }
}
