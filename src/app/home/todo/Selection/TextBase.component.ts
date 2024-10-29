import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input } from '@angular/core';

@Component({
	selector: 'text-base',
	styles: [
		`
			:host {
				border-radius: 0.5rem;
				margin-left: auto;
				margin-right: auto;
				width: 100%;
			}
		`,
	],
	template: `
		<h6
			class="relative mx-auto w-full h-fit text-center translate-y-[-50%] top-[50%]"
		>
			{{ text }}
		</h6>
		<ng-content></ng-content>
	`,
	standalone: true,
})
export class TextBase {
    // a base text class
	@Input() text!: string;
	constructor(public elementRef: ElementRef) {}
}

@Component({
	selector: 'dropdown-text',
	styles: [
		`
			:host {
				height: fit-content;
			}
		`,
	],
	template: `
		<text-base
			id="{{ disabled ? '' : 'hoverable' }}"
			(click)="reveal()"
			[text]="defText"
			class="{{
				disabled == true
					? 'block'
					: 'grid grid-cols-[80%20%] cursor-pointer'
			}} bg-[var(--secondary-darker)] w-[90%]"
			style="height: {{ height }}px"
		>
			<img
				*ngIf="!disabled"
				class="h-1/2 w-auto m-auto overflow-auto"
				src="assets/dropdown.png"
			/>
		</text-base>
	`,
	standalone: true,
	imports: [TextBase, CommonModule],
})
export class DropdownText {
    // used by selection list to display an arrow next to main selection 
    @Input() defText!: string;
	@Input() height!: number;

	@Input() reveal!: Function;
	@Input() onInit!: Function;
	
    @Input() disabled: boolean = false;

	constructor(public elementRef: ElementRef) {}

	ngAfterViewInit() {
		this.onInit(this.elementRef.nativeElement);
	}
}
