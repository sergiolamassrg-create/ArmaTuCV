import { Routes } from '@angular/router';
import { AccesoComponent } from './components/acceso/acceso.component';
import { controlarAcceso } from './services/acceso.guard';
export const routes: Routes = [
  { path: 'acceso', component: AccesoComponent },
  { path: '', redirectTo: 'acceso', pathMatch: 'full' },
  { path: '**', redirectTo: 'acceso' }
];
