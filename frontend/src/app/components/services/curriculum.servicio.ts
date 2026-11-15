import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Curriculum, DatosCurriculum, ResumenCurriculum } from '../models/curriculum';

@Injectable({ providedIn: 'root' })

export class CurriculumServicio {
    
    private http = inject(HttpClient);
    private ruta = '/api/curriculums';
    
    listar() { 
        return this.http.get<ResumenCurriculum[]>(this.ruta); 
    }
    
    obtener(id: string) { 
        return this.http.get<Curriculum>(this.ruta + '/' + id); 
    }
    
    crear(datos: DatosCurriculum) { 
        return this.http.post<Curriculum>(this.ruta, datos); 
    }
    
    actualizar(id: string, datos: DatosCurriculum) { 
        return this.http.put<Curriculum>(this.ruta + '/' + id, datos); 
    }
    
    eliminar(id: number) { 
        return this.http.delete<{ mensaje: string }>(this.ruta + '/' + id); 
    }
    
    mensaje(error: HttpErrorResponse) { 
        return error.error?.mensaje ?? 'No se pudo conectar con el servidor.'; 
    }
}