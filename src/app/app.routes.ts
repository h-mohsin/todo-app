import { Routes } from '@angular/router';
import { Home } from './home/home.component';
import { LoginPage } from './login/login.component';

export const routes: Routes = [
    { path: 'todo-page', component: Home},
    { path: 'login-page', component: LoginPage}
];
