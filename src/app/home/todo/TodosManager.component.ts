import {
	Component,
	ElementRef,
	Input,
	Renderer2,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { TodoList } from './TodoList.component';
import { TodoItem } from './Task/TodoItem.component';
import { EmptyTask } from './Task/TodoTask.component';

@Component({
	selector: 'small-button',
	styles: [
		`
			:host {
				margin: auto;
				padding: 4px;
			}
		`,
	],
	template: ` <div
		class="{{
			enabled ? 'bg-white scale-105' : 'bg-[var(--secondary-color)]'
		}} h-fulll w-full rounded-xl cursor-pointer transition-all"
	>
		<img
			[src]="src"
			class="m-auto h-full w-auto overflow-auto p-2 {{
				enabled && 'brightness-0'
			}} transition-all"
		/>
	</div>`,
	standalone: true,
})
export class Button {
	@Input() src = ''; // image of button url
	@Input() enabled: boolean = false;
}

@Component({
	selector: 'todo-manager',
	styles: [
		`
			:host {
				display: block;
				box-sizing: border-box;
				font-family: Arial, Helvetica, sans-serif;
				height: 100%;
				width: 100%;
				background: black;
			}
		`,
	],
	template: ` <div
		class=" w-full h-full grid"
		style="gridTemplateRows: 7rem auto"
	>
		<div class="grid grid-cols-[70%15%15%] h-fit w-[90%] m-auto">
			<h2 class="my-auto pl-4">Todos</h2>
			<small-button
				#add
				id="hoverable"
				src="/assets/add.png"
				(mouseup)="newList()"
			/>
			<small-button
				id="hoverable"
				src="/assets/edit.png"
				(click)="edititems()"
				[enabled]="editing"
			/>
		</div>

		<div
            #holder
			class="flex h-[calc(100vh-7rem)] flex-wrap w-full overflow-y-auto"
			style="align-content: flex-start; direction: rtl; scrollbar-color: revert; color-scheme: dark; scrollbar-width: thin; scrollbar-gutter: stable both-edges;"
		>
			<ng-container #itemFactory></ng-container>

			<todo-item
				#tempTask
				class="hidden absolute cursor-grab"
				style="transform: rotate(3deg); direction: ltr"
			/>

            <todo-list 
                #tempList
                class="hidden absolute cursor-grab"
                style="transform: rotate(3deg); direction: ltr"
                [empty]="true"
            />
			<!--this is the temporary item we use whenever the user initiates the dragging system-->
		</div>
	</div>`,
	standalone: true,
	imports: [Button, TodoList, TodoItem],
})
export class TodosManager {
	@ViewChild('itemFactory', { read: ViewContainerRef })
	itemFactory!: ViewContainerRef; // used to generate any new categories of tasks
    @ViewChild('holder', { read: ElementRef}) itemsHolder! : ElementRef;
	@ViewChild('add', { read: ElementRef }) addButton!: ElementRef; // add button

    @ViewChild('tempList') temp!: TodoItem; // used by further components to utilize in dragging system
	@ViewChild('tempTask') tempTask!: TodoItem; // used by further components to utilize in dragging system

	items: (TodoList | EmptyTask)[] = []; // contains all lists inside the view container
	editing: boolean = false;
    emptyList!: EmptyTask;

	lastListAdded!: TodoList | null;

	constructor(private renderer: Renderer2) {}

	newList = () => {
		if (
			!this.editing &&
			(this.lastListAdded == null || this.lastListAdded.isNamed)
		) {

            if (this.emptyList == null) {
                this.emptyList = this.itemFactory.createComponent(EmptyTask, {
                    index: 0,
                }).instance;
                this.pushSplice(this.emptyList, 1);
            }

			// adds new list only if edit mode is disabled
			const newList = this.itemFactory.createComponent(TodoList);
			newList.instance._init_(this, newList.hostView); // ref to parent is sent through _init_ function
			this.lastListAdded = newList.instance;
		}
	};

    pushSplice = (task : TodoList | EmptyTask, option : 1 | -1) => {
        if (option == 1) this.items.push(task); else this.items.splice(this.items.indexOf(task), 1);
    }

	setAddButtonVisibility = () => {
		// expand and collapse button configure on clicks
		this.renderer.setStyle(
			this.addButton.nativeElement,
			'opacity',
			(this.editing ? 0 : 1).toString()
		);
		this.renderer.setStyle(
			this.addButton.nativeElement,
			'pointerEvents',
			this.editing ? 'none' : 'all'
		);
	};

	edititems = () => {
		// edit mode
		this.editing = !this.editing;
		this.setAddButtonVisibility();
		this.edit();
	};

	edit = () => {
		// loops through items, collapses and resets their option images
		for (const list of this.items) {
            if (list instanceof TodoList) {
                list.onExpand(false);
                list.edit();
            }
		}
	};
}
