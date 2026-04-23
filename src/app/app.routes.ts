import { Routes } from '@angular/router';
import { Login } from './componentes/login/login';
import { Main } from './componentes/main/main';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'main', component: Main },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
