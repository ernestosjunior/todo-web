import { Routes } from '@angular/router';
import { Cadastro } from './components/cadastro/cadastro';
import { Login } from './components/login/login';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'cadastro', component: Cadastro },
];
