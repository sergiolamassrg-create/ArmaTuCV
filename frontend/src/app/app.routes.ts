import { Component } from '@angular/core';
import { Routes, RouterLink } from '@angular/router';
import { CvListadoComponent } from './components/cv-listado/cv-listado.component';
import { CvFormularioComponent } from './components/cv-formulario/cv-formulario.component';
import { CvDetalleComponent } from './components/cv-detalle/cv-detalle.component';
import { AccesoComponent } from './components/acceso/acceso.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { UsuarioFormularioComponent } from './components/usuario-formulario/usuario-formulario.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { BibliotecaFotosComponent } from './components/biblioteca-fotos/biblioteca-fotos.component';
import { SobreNosotrosComponent } from './components/sobre-nosotros/sobre-nosotros.component';
import { ContactoComponent } from './components/contacto/contacto.component';
import { AvisoAcademicoComponent } from './components/aviso-academico/aviso-academico.component';
import { controlarAcceso } from './services/acceso.guard';

@Component({
  imports: [RouterLink],
  template: `<section><h1>Página no encontrada</h1><p>Esta dirección no está disponible.</p><a routerLink="/" class="btn btn-primary">Volver al inicio</a></section>`
})

class NoEncontradoComponent { }

export const routes: Routes = [
  { path: '', component: InicioComponent, pathMatch: 'full', title: 'ArmaTuCV' },
  { path: 'acceso', component: AccesoComponent, title: 'Acceso — ArmaTuCV' },
  { path: 'registro', component: AccesoComponent, data: { registro: true }, title: 'Crear cuenta — ArmaTuCV' },
  { path: 'curriculums', canActivate: [controlarAcceso], component: CvListadoComponent, title: 'Mis currículums — ArmaTuCV' },
  { path: 'curriculums/nuevo', canActivate: [controlarAcceso], component: CvFormularioComponent, title: 'Nuevo CV — ArmaTuCV' },
  { path: 'curriculums/:id/editar', canActivate: [controlarAcceso], component: CvFormularioComponent, title: 'Editar CV — ArmaTuCV' },
  { path: 'curriculums/:id', canActivate: [controlarAcceso], component: CvDetalleComponent, title: 'Mi CV — ArmaTuCV' },
  { path: 'fotos', canActivate: [controlarAcceso], component: BibliotecaFotosComponent, title: 'Mis fotografías — ArmaTuCV' },
  { path: 'perfil', canActivate: [controlarAcceso], component: PerfilComponent, title: 'Mi perfil — ArmaTuCV' },
  { path: 'usuarios', canActivate: [controlarAcceso], data: { soloAdministrador: true }, component: UsuariosComponent, title: 'Usuarios — ArmaTuCV' },
  { path: 'usuarios/nuevo', canActivate: [controlarAcceso], data: { soloAdministrador: true }, component: UsuarioFormularioComponent, title: 'Crear usuario — ArmaTuCV' },
  { path: 'usuarios/:id/editar', canActivate: [controlarAcceso], data: { soloAdministrador: true }, component: UsuarioFormularioComponent, title: 'Editar usuario — ArmaTuCV' },
  { path: 'sobre-nosotros', component: SobreNosotrosComponent, title: 'Sobre nosotros — ArmaTuCV' },
  { path: 'contacto', component: ContactoComponent, title: 'Contacto — ArmaTuCV' },
  { path: 'aviso-academico', component: AvisoAcademicoComponent, title: 'Aviso académico — ArmaTuCV' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];