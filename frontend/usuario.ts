<h1>{{ id ? 'Editar usuario' : 'Crear usuario' }}</h1>
@if (error()) { <p role="alert">{{ error() }}</p> }
@if (cargando()) { <p>Cargando cuenta...</p> }
<form [formGroup]="formulario" (ngSubmit)="guardar()">
  <fieldset [disabled]="cargando() || guardando()">
    <label>Nombre <input type="text" formControlName="nombre" maxlength="100"></label>
    @if (formulario.controls.nombre.touched && formulario.controls.nombre.invalid) { <p>Ingresá un nombre.</p> }
    <label>Apellido <input type="text" formControlName="apellido" maxlength="100"></label>
    @if (formulario.controls.apellido.touched && formulario.controls.apellido.invalid) { <p>Ingresá un apellido.</p> }
    <label>Correo <input type="email" formControlName="email" maxlength="150"></label>
    @if (formulario.controls.email.touched && formulario.controls.email.invalid) { <p>Ingresá un correo válido.</p> }
    <label>Rol
      <select formControlName="rol"><option value="usuario">Usuario</option><option value="administrador">Administrador</option></select>
    </label>
    <label>Cuenta activa <input type="checkbox" formControlName="activo"></label>
    <label>Contraseña {{ id ? '(opcional: dejar vacía para conservarla)' : '(obligatoria)' }}
      <input type="password" formControlName="password" minlength="12" maxlength="128" autocomplete="new-password">
    </label>
    <label>Repetir contraseña
      <input type="password" formControlName="repetirClave" autocomplete="new-password">
    </label>
    <button type="submit" [disabled]="guardando() || cargando()">{{ guardando() ? 'Guardando...' : 'Guardar' }}</button>
    <a routerLink="/usuarios">Cancelar</a>
  </fieldset>
</form>
