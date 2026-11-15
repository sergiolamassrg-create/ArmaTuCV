import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Foto } from '../models/foto';

@Injectable({ providedIn: 'root' })
export class FotoServicio {
  private http = inject(HttpClient);
  listar() { return this.http.get<Foto[]>('/api/fotos'); }
  subir(nombre: string, foto: string) { return this.http.post<Foto>('/api/fotos', { nombre, foto }); }
  eliminar(id: number) { return this.http.delete<{ mensaje: string }>('/api/fotos/' + id);
 }
}