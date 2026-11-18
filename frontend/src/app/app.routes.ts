import { Routes } from '@angular/router';
import { CvListadoComponent } from './components/cv-listado/cv-listado.component';
import { CvFormularioComponent } from './components/cv-formulario/cv-formulario.component';
import { CvDetalleComponent } from './components/cv-detalle/cv-detalle.component';
import { AccesoComponent } from './components/acceso/acceso.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { UsuarioFormularioComponent } from './components/usuario-formulario/usuario-formulario.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { SobreNosotrosComponent } from './components/sobre-nosotros/sobre-nosotros.component';
import { GuiaCvComponent } from './components/guia-cv/guia-cv.component';
import { controlarAcceso, soloVisitantes } from './services/acceso.guard';

export const routes: Routes = [
  { path: '', component: InicioComponent, pathMatch: 'full', title: 'ArmaTuCV' },
  {
    path: 'acceso',
    canActivate: [soloVisitantes],
    component: AccesoComponent,
    title: 'Acceso — ArmaTuCV',
  },
  {
    path: 'registro',
    canActivate: [soloVisitantes],
    component: AccesoComponent,
    data: { registro: true },
    title: 'Crear cuenta — ArmaTuCV',
  },
  {
    path: 'curriculums',
    canActivate: [controlarAcceso],
    component: CvListadoComponent,
    title: 'Mis currículums — ArmaTuCV',
  },
  {
    path: 'curriculums/nuevo',
    canActivate: [controlarAcceso],
    component: CvFormularioComponent,
    title: 'Nuevo CV — ArmaTuCV',
  },
  {
    path: 'curriculums/:id/editar',
    canActivate: [controlarAcceso],
    component: CvFormularioComponent,
    title: 'Editar CV — ArmaTuCV',
  },
  {
    path: 'curriculums/:id',
    canActivate: [controlarAcceso],
    component: CvDetalleComponent,
    title: 'Mi CV — ArmaTuCV',
  },
  {
    path: 'perfil',
    canActivate: [controlarAcceso],
    component: PerfilComponent,
    title: 'Mi perfil — ArmaTuCV',
  },
  {
    path: 'usuarios',
    canActivate: [controlarAcceso],
    data: { soloAdministrador: true },
    component: UsuariosComponent,
    title: 'Usuarios — ArmaTuCV',
  },
  {
    path: 'usuarios/nuevo',
    canActivate: [controlarAcceso],
    data: { soloAdministrador: true },
    component: UsuarioFormularioComponent,
    title: 'Crear usuario — ArmaTuCV',
  },
  {
    path: 'usuarios/:id/editar',
    canActivate: [controlarAcceso],
    data: { soloAdministrador: true },
    component: UsuarioFormularioComponent,
    title: 'Editar usuario — ArmaTuCV',
  },
  { path: 'sobre-nosotros', component: SobreNosotrosComponent, title: 'Sobre nosotros — ArmaTuCV' },
  { path: 'guia-del-cv', component: GuiaCvComponent, title: 'Guía del CV — ArmaTuCV' },
  { path: 'contacto', redirectTo: '/sobre-nosotros', pathMatch: 'full' },
  {
    path: 'aviso-academico',
    redirectTo: '/sobre-nosotros',
    pathMatch: 'full',
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];