import { Component } from '@angular/core';
import { InputBox } from './input.component';

@Component({
	selector: 'login-page',
	styles: [
		`
			:host {
				@apply w-full h-full block bg-transparent absolute;
			}
		`,
	],
	template: `
		<div
			class="bg-white m-auto w-[22%] h-[50%] block relative rounded-3xl drop-shadow-lg top-[50%] translate-y-[-50%]"
		>
			<div
				class="w-full h-full grid grid-flow-row grid-rows-[40%60%] p-6"
			>
				<div class="w-full h-full">
					<div
						id="g_id_onload"
						data-client_id="775594834549-1b0rga0me35sva7eaf6uvs1glddorboi.apps.googleusercontent.com"
						data-context="signin"
						data-ux_mode="popup"
						data-login_uri="http://localhost:4000/todo-entries"
						data-auto_select="true"
						data-itp_support="true"
					></div>

					<div
						class="g_id_signin"
						data-type="standard"
						data-shape="rectangular"
						data-theme="filled_black"
						data-text="signin_with"
						data-size="medium"
						data-logo_alignment="left"
					></div>
				</div>
				<div class="w-full h-full grid grid-rows-[30%30%35%5%]">
					<input-box
						[label]="'E-Mail address'"
						[placeHolder]="'***@gmail.com'"
						[type]="'text'"
						[onChange]="validateEmail"
					/>
					<input-box
						[label]="'Password'"
						[placeHolder]="'Enter at least 8 characters'"
						[type]="'password'"
						[onChange]="validatePassword"
					/>
					<div class="w-full h-full grid grid-rows-[30%70%]">
						<h5 class="text-inherit m-auto">
							Remember me, Forgot password
						</h5>
						<div class="h-full w-full py-3">
							<div
								class="bg-black rounded-xl w-full h-full cursor-pointer p-2"
							>
								<div
									class="h-fit w-fit text-center m-auto text-inherit text-white font-medium"
								>
									Sign in
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	`,
	standalone: true,
	imports: [InputBox],
})
export class LoginPage {
	static emailRegex: RegExp =
		/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	static passwordRegex1: RegExp =
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

	static passwordRegex: Object = [
		['(?=.*[a-z])'],
		['(?=.*[A-Z])'],
		['(?=.*d)'],
		['[a-zA-Zd]'],
		['{8,}'],
	];

	validateEmail = (s: string) => {
		const success = LoginPage.emailRegex.test(s);
		return [success, success ? 'Valid email' : 'Invalid email'];
	};

	validatePassword = (s: string) => {
		const success = LoginPage.passwordRegex1.test(s);
		return [success, success ? 'Valid password' : 'Invalid password'];
	};
}
