import { Routes } from '@angular/router';
import { Cadastro } from './components/cadastro/cadastro';
import { Login } from './components/login/login';
import { Board } from './components/board/board';
import { AuthGuard } from './guards/auth';

export const routes: Routes = [
  { path: '', component: Login, canActivate: [AuthGuard] },
  { path: 'cadastro', component: Cadastro },
  { path: 'board', component: Board },
];
