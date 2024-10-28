import { Component, ElementRef, Input, Renderer2 } from '@angular/core';
import { ToggleComponent } from './Toggle.component';
import {
	heightLeaveTransition,
	heightTransition,
	opacityTranslateTransition,
} from '../../Animations/Animations';
import { TodoItem } from '../Task/TodoItem.component';
import { CommonModule } from '@angular/common';
import { TodoTask } from '../Task/TodoTask.component';

@Component({
	selector: 'selection-template-plain',
	template: `
		<div
			class="grid grid-cols-[50%50%] w-full relative"
			style="height: ${TodoItem.taskEditHeight /
			TodoItem.numOptions}px"
		>
			<h5 class="h-fit w-full m-auto text-left">{{ label }}</h5>
			<ng-content />
		</div>
	`,
	standalone: true,
})
export class SelectionTemplatePlain {
    // just a plain holder for a selection template 
	@Input() label!: string;
}

@Component({
	selector: 'selection-template',
	host: { '[@heightTransition]': 'true' },
	styles: [
		`
			:host {
				@apply block h-fit w-full relative;
			}
		`,
	],
	template: `
		<selection-template-plain [label]="label">
			<toggle [parent]="this" />
		</selection-template-plain>

		<div
			*ngIf="toggled"
			class="w-full m-auto block"
			[@heightTransition]="true"
			[@opacityTranslateTransition]="true"
			style="height: ${TodoItem.taskEditHeight /
			TodoItem.numOptions}px"
		>
			<ng-content />
		</div>
	`,
	standalone: true,
	imports: [ToggleComponent, CommonModule, SelectionTemplatePlain],
	animations: [
		heightTransition,
		heightLeaveTransition,
		opacityTranslateTransition,
	],
})
export class SelectionTemplate {
    // selection template with a toggle button
	@Input() parent!: TodoTask;
	@Input() label!: string;

	toggled: boolean = false;

	setToggle = (enabled: boolean) => {
		this.toggled = enabled;
		this.parent.updateHeight(enabled);
	};
}
