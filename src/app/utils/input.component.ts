import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
	selector: 'input-label',
	styles: [':host {height: fit-content; width: 100%; margin: auto 0 auto}'],
	template: `
		<input
			#input
			class="outline-none w-full bg-transparent h-full transition-all my-auto font-['Inter',sans-serif]"
			value="{{ text }}"
			style="color: {{ color }}"
			(blur)="onFocusLost(input)"
			(keydown.escape)="input.blur()"
			(keydown)="beforeTab($event, input)"
			maxLength="20"
			autofocus
		/>
	`,
	standalone: true,
})
export class InputLabel {
	@Input() color = 'white';

	// functions to call
	@Input() onRejection!: Function;
	@Input() onSuccess!: Function;
	@Input() onTab!: Function;

	// results to true if the parent is being edited (used to edit input label)
	editing!: boolean;

	@Input() text: string = '';

	@ViewChild('input') inputElement!: ElementRef;
	input!: HTMLInputElement;

	getValue = (input: HTMLInputElement) => {
		return input.value.replace(/\s+/g, ' ').trim(); // clear whitespace before getting value
	};

	ngAfterViewInit() {
		this.input = this.inputElement.nativeElement;
		this.input.focus();
	}

	beforeTab = (e: KeyboardEvent, input: HTMLInputElement) => {
		// allows consequent creation of tasks with ctrl + enter keys
		if (e.key == 'Enter' && e.ctrlKey) {
			if (this.onTab != null) this.onTab(this.getValue(input));
			return;
		} else if (e.key == 'Enter') {
			this.onFocusLost(input);
		}
	};

	onFocusLost = (input: HTMLInputElement): void => {
		if (this.editing) {
            // if its editing then we dont do anything 
			return;
		}

		const value = this.getValue(input);
		if (value.length == 0) {
			if (this.onRejection != null) this.onRejection();
		} else {
			if (this.onSuccess != null) this.onSuccess(value);
			this.setReadOnly(true);
		}
	};

	setReadOnly = (readonly: boolean = false, editing?: boolean) => {
		this.input.readOnly = readonly;
		if (editing != null) this.editing = editing;
	};
}
