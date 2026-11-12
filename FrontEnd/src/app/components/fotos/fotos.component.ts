import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FotoServicio } from '../../services/foto.servicio';
import { Foto } from '../../models/foto';

@Component({ selector: 'app-fotos', templateUrl: './fotos.component.html' })
export class FotosComponent implements OnInit {
  private servicio = inject(FotoServicio);
  @Input() seleccion: number | null = null;
  @Input() bloqueado = false;
  @Output() elegir = new EventEmitter<Foto | null>();
  @Output() ocupado = new EventEmitter<boolean>();
  fotos = signal<Foto[]>([]);
  error = signal('');
  pendiente = signal(false);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.servicio
      .listar()
      .subscribe({
        next: (fotos) => this.fotos.set(fotos),
        error: () => this.error.set('No se pudo cargar la biblioteca.'),
      });
  }

  async subir(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    this.pendiente.set(true);
    this.ocupado.emit(true);
    try {
      const base64 = await this.prepararFoto(archivo);
      const foto = await firstValueFrom(this.servicio.subir(archivo.name.slice(0, 100), base64));
      this.fotos.update((lista) => [foto, ...lista.filter((f) => f.id !== foto.id)]);
      this.elegir.emit(foto);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo subir la foto.');
    } finally {
      input.value = '';
      this.pendiente.set(false);
      this.ocupado.emit(false);
    }
  }

  // El procesamiento de imagen permanece en el componente durante Fase 2.
  async prepararFoto(archivo: File): Promise<string> {
    if (!['image/jpeg', 'image/png'].includes(archivo.type) || archivo.size > 5 * 1024 * 1024)
      throw new Error('Elegí un JPG o PNG de hasta 5 MB.');
    const imagen = await createImageBitmap(archivo);
    try {
      const lado = Math.min(imagen.width, imagen.height);
      if (imagen.width * imagen.height > 24000000)
        throw new Error('La imagen supera 24 megapíxeles.');
      const lienzo = document.createElement('canvas');
      lienzo.width = 320;
      lienzo.height = 320;
      const contexto = lienzo.getContext('2d');
      if (!contexto) throw new Error('No se pudo procesar la imagen.');
      contexto.fillStyle = 'white';
      contexto.fillRect(0, 0, 320, 320);
      contexto.drawImage(
        imagen,
        (imagen.width - lado) / 2,
        (imagen.height - lado) / 2,
        lado,
        lado,
        0,
        0,
        320,
        320,
      );
      const foto = lienzo.toDataURL('image/jpeg', 0.8);
      if (foto.length > 120023) throw new Error('La foto reducida supera 90 KB.');
      return foto;
    } finally {
      imagen.close();
    }
  }
}
