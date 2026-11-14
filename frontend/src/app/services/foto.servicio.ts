import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Foto } from '../models/foto';

@Injectable({ providedIn: 'root' })
export class FotoServicio {
  private http = inject(HttpClient);
  listar() {
    return this.http.get<Foto[]>('/api/fotos');
  }
  subir(nombre: string, foto: string) {
    return this.http.post<Foto>('/api/fotos', { nombre, foto });
  }
  eliminar(id: number) {
    return this.http.delete<{ mensaje: string }>('/api/fotos/' + id);
  }

  async prepararFoto(archivo: File): Promise<string> {
    if (!['image/jpeg', 'image/png'].includes(archivo.type) || archivo.size > 5 * 1024 * 1024) {
      throw new Error('Elegí una foto JPG o PNG de hasta 5 MB.');
    }
    const imagen = await createImageBitmap(archivo);
    try {
      if (imagen.width * imagen.height > 24000000)
        throw new Error('La foto debe tener como máximo 24 megapíxeles.');
      const lienzo = document.createElement('canvas');
      lienzo.width = lienzo.height = 320;

      const contexto = lienzo.getContext('2d');
      if (!contexto) throw new Error('El navegador no pudo procesar la foto.');

      const lado = Math.min(imagen.width, imagen.height);
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

      // Cuadrada, sin metadatos de la cámara y de tamaño acotado para SQL.
      const foto = lienzo.toDataURL('image/jpeg', 0.8);

      if (foto.length > 120023)
        throw new Error('Elegí una foto más sencilla; la imagen reducida supera 90 KB.');

      return foto;
    } finally {
      imagen.close();
    }
  }
}
