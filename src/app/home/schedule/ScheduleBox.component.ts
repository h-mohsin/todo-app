import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'schedule-box',
	styles: [
		`
			:host {
				height: auto;
				width: auto;
			}
		`,
	],
	template: `
		<div
			class="h-full w-full rounded-3xl shadow-md"
			style="background-color: {{ color }}"
		>
			<div class="h-full w-full p-3">
				<h4 *ngIf="!multiple" class="text-black">{{ desc }}</h4>

				<div class="w-full {{multiple && 'grid grid-cols-[90%10%]'}}">
					<h5
						class="text-black font-medium w-full"
					>
						{{ label }}
					</h5>
					<img
						*ngIf="multiple"
						src="/assets/multiple.png"
						class="h-full w-auto cursor-pointer"
						id="hoverable"

                        (click)="onMultipleClick()"
					/>
				</div>
			</div>
		</div>
	`,
	standalone: true,
	imports: [CommonModule],
})
export class ScheduleBox {
	@Input() desc!: string;
	@Input() label!: string;
	@Input() color!: string;
	@Input() multiple: boolean = false;

    multipleEnabled : boolean = false;

    onMultipleClick = () => {
        this.multipleEnabled = !this.multipleEnabled;
    }
}
