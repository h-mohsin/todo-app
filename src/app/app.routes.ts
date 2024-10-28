import { Routes } from '@angular/router';
import { Home } from './home/home.component';
import { LoginPage } from './login/login.component';

export const routes: Routes = [
    { path: 'home', component: Home},
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full'
    }
];
