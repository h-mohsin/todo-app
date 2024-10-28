import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './home/home.component';
import { LoginPage } from './login/login.component';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-root',
	styles: [
		`
			:host {
				display: block;
				height: 100vh;
			}
		`,
	],
	standalone: true,
	imports: [RouterOutlet, Home, LoginPage, CommonModule],
	schemas: [NO_ERRORS_SCHEMA],
	template: `<home-page class="{{loginEnabled ? ' blur-[4px] scale-[1.005]' : ''}}"/>
                <login-page *ngIf="loginEnabled"/>`,
})
export class AppComponent {
    loginEnabled : boolean = false;
}
