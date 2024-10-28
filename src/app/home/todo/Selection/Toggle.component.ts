import { Component, Input } from '@angular/core';
import { SelectionTemplate } from './SelectionTemplate.component';

@Component({
	selector: 'toggle',
	host: {
		id: 'hoverable',
		'(click)': 'onToggle()',
	},
	styles: [
		`
			:host {
				@apply w-full max-w-[55px] my-auto ml-auto mr-0 bg-[var(--secondary-darker)] rounded-[25%/50%] aspect-[2/1] p-[4px] cursor-pointer transition-all hover:brightness-[120%];
			}
		`,
	],
	template: `
		<div
			class="rounded-[50%] bg-[var(--border-light)] h-full aspect-square relative {{
				enabled &&
					'translate-x-[calc(100%+8px)] bg-[var(--primary-contrast-darker)]'
			}} transition-all"
		></div>
	`,
	standalone: true,
})
export class ToggleComponent {
    // toggle component that moves on the x axis whenever clicked
	@Input() parent!: SelectionTemplate;
	enabled: boolean = false;

	onToggle = () => {
		this.enabled = !this.enabled;
		this.parent.setToggle(this.enabled); // call any functions needed to be called
	};
}
