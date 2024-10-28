import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'input-box',
	styles: [
		`
			:host {
				@apply h-full w-full grid grid-rows-[30%60%10%] py-2;
			}
		`,
	],
	template: `
		<h5 class="text-black font-normal">{{label}}</h5>
		<div class="h-full w-full rounded-xl border-gray-400 border-2 grid grid-cols-[90%10%]">
            <input #input placeholder={{placeHolder}} class="bg-transparent w-full h-full m-auto px-2 focus:outline-none focus:placeholder:opacity-0 placeholder:transition-all" type={{type}} (input)="onInputChange($event, input, response_label)"/>
            <img *ngIf="type == 'password'" src={{visibilityImage}} (click)="onVisibilityChange(input)" class="w-auto h-1/2 overflow-auto m-auto brightness-50 cursor-pointer"/>
        </div>
        <h5 #response_label class="w-full h-full text-inherit text-red-500"></h5>
	`,
	standalone: true,
    imports: [CommonModule]
})
export class InputBox {
    @Input() label! : string;
    @Input() placeHolder! : string;
    @Input() type! : string;

    @Input() onEnter! : Function;
    @Input() onChange! : Function;

    static inputValid = "#ff0000";
    static inputInvalid = "#00ff00";

    static visible = "/assets/visible.png";
    static invisible = "/assets/notvisible.png";

    isVisible = false;
    visibilityImage = InputBox.visible;

    onVisibilityChange = (input : HTMLInputElement) => {
        this.isVisible = !this.isVisible;
        this.visibilityImage = this.isVisible ? InputBox.invisible : InputBox.visible;
        input.type = this.isVisible ? "text" : "password";
    }

    onInputChange = (e : Event, input : HTMLInputElement, label : HTMLHeadingElement) => {
        const content = (e.target as HTMLTextAreaElement).value.replace(" ", '');
        
        if (content != "") {
            const response = this.onChange(content);
            const success = response[0];
            if (!success) {
                const responseText = response[1];
                label.innerHTML = responseText;
                return;
            }
        }

        label.innerHTML = "";
    }
}
