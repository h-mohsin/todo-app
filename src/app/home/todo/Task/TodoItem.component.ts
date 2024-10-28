import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputLabel } from '../../../utils/input.component';
import { TodoTask } from './TodoTask.component';
import {
	heightLeaveTransition,
	heightTransition,
	opacityTranslateTransition,
    opacityTranslateTransition2,
} from '../../Animations/Animations';
import { isDraggable } from '../isDraggable';

@Component({
	selector: 'todo-item',
	styles: [
		`
			:host {
				width: 100%;
				height: 100%;

			}
		`,
	],
	template: `
		<div class="w-full h-full relative">
			<div
				class="w-full py-2 relative z-10"
				style="height: ${TodoItem.taskHeight}px"
				(click)="onDivClick != null && onDivClick()"
			>
				<div
					class="group grid grid-cols-[15%70%15%] w-full h-full rounded-lg transition-all cursor-pointer {{
						parent && this.parent.expanded && 'bg-[var(--secondary-darker)]'
					}} hover:bg-[var(--secondary-darker)]"
				>
					<div
						#fill
						class="border-[var(--border-light)] border-2 rounded-md m-auto h-5 w-5 cursor-pointer transition-all z-10"
						(click)="onImageClick != null && onImageClick(fill)"
					>
						<img
							*ngIf="isInstantiator"
							class="group-hover:brightness-150 m-auto"
							src="/assets/add.png"
						/>
					</div>
					<input-label
						*ngIf="!isInstantiator"
						[color]="color"
						[onSuccess]="onSuccess"
						[onRejection]="remove"
						[text]="text"
						[onTab]="onTab"
						(mouseDown)="onMouseDown($event)"
					/>
					<img
                        #draggable
						*ngIf="!isInstantiator && parent != null && parent.isNamed"
						src="/assets/drag.png"
						class="h-1/2 w-auto overflow-auto m-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible z-10"
						id="hoverable"
						(click)="parent.onExpand()"
                        draggable="false"
					/>
					<h5
						*ngIf="isInstantiator"
						class="h-fit w-full my-auto text-[var(--border-light)] transition-all group-hover:brightness-200"
					>
						Todo
					</h5>
				</div>
			</div>

            <ng-content/>
		</div>
	`,
	standalone: true,
	imports: [
		InputLabel,
		CommonModule,
	],
	animations: [
		opacityTranslateTransition,
		heightLeaveTransition,
		heightTransition,
        opacityTranslateTransition2
	],
})
export class TodoItem {
    @ViewChild('draggable') draggable!: ElementRef;

    // the base class for all the todo items that are in every category
	static taskHeight = 50;
	static taskEditHeight = 160;
	static numOptions = 4;

	@Input() parent!: TodoTask;

	@Input() color = 'white';
	text: string = '';

    // functions to be called
	@Input() onDivClick!: Function;
	@Input() onImageClick!: Function;
	@Input() onMouseDown!: Function;

	@Input() isInstantiator: boolean = false;

	@Input() remove!: Function;
	@Input() onSuccess!: Function;
	@Input() onTab!: Function;

    constructor(private renderer: Renderer2, public elementRef : ElementRef) {}

    setStyle = (style : string, value : any) => {
        this.renderer.setStyle(this.elementRef.nativeElement, style, value);
    }
}
