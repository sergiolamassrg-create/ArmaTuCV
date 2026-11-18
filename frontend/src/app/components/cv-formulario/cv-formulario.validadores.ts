import { AbstractControl, ValidationErrors } from '@angular/forms';

export function fechaValida(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === '' || valor === null) return null;
  if (typeof valor !== 'string' || valor.length !== 10) return { fechaInvalida: true };
  const fecha = new Date(valor + 'T00:00:00Z');
  if (
    Number.isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== valor ||
    valor < '0001-01-01'
  ) {
    return { fechaInvalida: true };
  }
  return null;
}

export function fechasOrdenadas(grupo: AbstractControl): ValidationErrors | null {
  const inicio = grupo.get('fechaInicio')?.value;
  const fin = grupo.get('fechaFin')?.value;
  return inicio && fin && fin < inicio ? { fechasDesordenadas: true } : null;
}

export function aniosOrdenados(grupo: AbstractControl): ValidationErrors | null {
  const inicio = grupo.get('anioInicio')?.value;
  const fin = grupo.get('anioFin')?.value;
  return inicio !== null && fin !== null && fin < inicio ? { aniosDesordenados: true } : null;
}