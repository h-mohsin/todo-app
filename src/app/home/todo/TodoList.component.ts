import {
	Component,
	HostBinding,
	ViewChild,
	ElementRef,
	ViewContainerRef,
	ViewRef,
	Renderer2,
    ComponentRef,
    Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { TodoItem } from './Task/TodoItem.component';
import { TodoTask, NewTodo, EmptyTask } from './Task/TodoTask.component';
import { InputLabel } from '../../utils/input.component';
import { TodosManager } from './TodosManager.component';

import {
	heightLeaveTransition,
	heightTransition,
	opacityTranslateTransition,
} from '../Animations/Animations';
import { expandContract } from '../Animations/ExpandContract';
import { isDraggable } from './isDraggable';

@Component({
	selector: 'todo-list',
	styles: [
		`
			:host {
				direction: ltr;
				@apply px-5  w-full h-fit;
			}
		`,
	],
	template: `
    <div class="h-fit" style="padding-bottom: ${TodoList.ListGap}px">
		<div
            #resizable
			class="bg-[var(--secondary-color)] w-full rounded-xl"
            style="height: ${TodoList.listHeight - TodoList.ListGap}px; padding:${TodoList.listYPadding}px 16px"
		>
			<div #list class="grid grid-cols-[10%80%10%]"
                style="height: ${TodoList.listHeight - (2*TodoList.listYPadding + TodoList.ListGap)}px">
                <img
                    #draggable
					[src]="parent == null ? 'assets/drag.png' : (parent.editing ? 'assets/edit.png' : 'assets/drag.png')"
					class="my-auto h-[50%] w-auto cursor-pointer"
					id="hoverable"
                    (click)="focusInput()"
                    draggable="false"
				/>
                <input-label
                    #input
					[color]="
						this.expanded ? 'var(--primary-contrast)' : 'white'
					"
					[onSuccess]="onSuccess"
					[onRejection]="delete"
                    [onTab]="onTab"
                    [text]="text"
				/>
				<img
                    *ngIf="!empty"
					#img
					[src]="optionImage"
					class="m-auto h-[50%] w-auto cursor-pointer"
					(click)="((this.parent.editing == true) ? delete() : onExpand())"
					id="hoverable"
				/>
			</div>
			<div
				#itemsHolder
				class="hidden grid-rows-[repeat(auto-fit,minmax(0,1fr)] transition-all relative h-fit opacity-0"
				[@opacityTranslateTransition]="true"
			>
				<ng-container #itemFactory> </ng-container>
				<todo-instantiator
					#instantiator
					[onAdd]="newTask"
					class="revealable relative block"
				/>
			</div>
		</div>
    </div>
	`,
	standalone: true,
	imports: [TodoItem, TodoTask, NewTodo, InputLabel, CommonModule],
	animations: [opacityTranslateTransition, heightLeaveTransition, heightTransition, expandContract],
    hostDirectives: [isDraggable]
})
export class TodoList {
	static listHeight = 65;
	static listYPadding = 8;
    static ListGap = 15;
	static speedCollapse = 350; // px / s

	// images
	static add: string = 'assets/add.png';
	static remove: string = 'assets/remove.png';
	static delete: string = 'assets/delete.png';

    static lastTaskExpanded : TodoTask;

	@ViewChild('itemFactory', { read: ViewContainerRef })
	itemFactory!: ViewContainerRef;
    @ViewChild('resizable') resizable!: ElementRef;
	@ViewChild('instantiator', { read: ElementRef }) instantiator!: ElementRef;
	@ViewChild('itemsHolder') itemsHolder!: ElementRef;
    @ViewChild('input') input! : InputLabel;
    @ViewChild('draggable') draggable!: ElementRef;

    @Input() empty : boolean = false;

    temp!: TodoItem;

	parent!: TodosManager; // to call functions related to parent
	view!: ViewRef;
	lastTaskExpanded!: TodoTask | null;

	// all items objects in the list
	// updates the height as items are set and deleted
	items: (TodoTask | EmptyTask)[] = [];

	isNamed: boolean = false; // whether the list is confirmed to be added (name of the list has been input)

	expanded: boolean = false;
	optionImage: string = TodoList.add; // default image is the expand icon

	instantiatorVisible: boolean = true;
	height: number = TodoList.listHeight - TodoList.ListGap;
    editingLabel: boolean = false;

    component : TodoList = this;
    allowTrade : boolean = false;

	// i avoided using angular animations with the '*' wildcard for height since it will require setTimeout() to correctly calibrate the timing for the collapse animation
	@HostBinding('@opacityTranslateTransition') revealChange: boolean = true;
	@HostBinding('@heightTransition') heightEnter: boolean = true;
	@HostBinding('@expandContract') get getExpand() {
        return {
            value: this.expandForEmpty ? 'expand' : 'contract',
            params: {height: this.expandForEmpty ? TodoList.listHeight * 7 / 4 : TodoList.listHeight}
        }
	}

	expandForEmpty: boolean = false;

	emptyTask!: EmptyTask;
    text! : string;

	hostElement: HTMLElement;
	currentIndex: number = -1;

	constructor(public elementRef: ElementRef, private renderer: Renderer2) {
		this.hostElement = elementRef.nativeElement;
	}

    ngAfterViewInit() {
        this.input.input.onblur = () => {
            this.editingLabel = false;
        }

        this.input.input.onfocus = () => {
            this.editingLabel = true;
        }

        this.setHeight(false); // initial height update
    }

	_init_ = (parent: TodosManager, viewRef: ViewRef) => {
		// fake constructor runs after component creation to pass necessary parameters
		parent.pushSplice(this, 1); // add this new list to parent log of items

		this.parent = parent;
		this.currentIndex = parent.items.length - 1;
		this.view = viewRef;
        this.temp = this.parent.tempTask;
	};

	delete = () => {
		this.parent.itemFactory.remove(
			this.parent.itemFactory.indexOf(this.view)
		);

        this.parent.pushSplice(this, -1);
		
        if (this.parent.lastListAdded == this) {
            this.parent.lastListAdded = null;
        }

		if (this.parent.items.length == 0 && this.parent.editing) {
			// if edit mode is expanded, we disable it
			this.parent.edititems();
		}
	};

    edit = () => {
        const isEditing : boolean = this.parent.editing;
        this.optionImage = isEditing ? TodoList.delete : TodoList.add;

        if (isEditing)
            this.editingLabel = false;
    }

    setStyle = (style : string, value : any) => {
        this.renderer.setStyle(this.elementRef.nativeElement, style, value);
    }

    focusInput = () => {
        if (!this.editingLabel) {
            this.input.input.focus();
            this.input.input.readOnly = false;
        } else {
            this.input.input.blur();
            this.input.input.readOnly = true;
        }
    }

	onTab = (s : string) => {
		// leads to creation of another task when tab is pressed
		this.onSuccess(s);
		this.parent.newList();
	};

	onSuccess = (s : string) => {
		this.isNamed = true;
        this.text = s;

        new Promise((resolve) => {
            const waitForDraggable = () => {
                if (this.draggable) resolve(true);
                setTimeout(() => waitForDraggable(), 30);
            }

            waitForDraggable();
        }).then(() => {
            this.draggable = this.draggable;
        })
	};

    showList = () => {
        this.renderer.setStyle(
            this.itemsHolder.nativeElement,
            'display',
            (this.expanded && 'block') || 'none'
        );

        this.renderer.setStyle(
            this.itemsHolder.nativeElement,
            'opacity',
            (this.expanded && 1) || 0
        );
    }

	onExpand = (expand?: boolean) => {
		if (this.isNamed) {
			this.expanded = expand != null ? expand : !this.expanded;
			this.optionImage =
				(this.expanded && TodoList.remove) || TodoList.add;
            
            const timeTaken = this.setHeight(this.expanded);

            if (this.expanded)
                setTimeout(() => {
                    this.showList()
                }, timeTaken * 300)
            else 
                this.showList();

			// ^ set the visibility of the whole grid of items
		}
	};

	setHeight = (px?: number | boolean, t?: number) : number => {
		const lastHeight = this.hostElement.offsetHeight;
		let finalHeight = 0;

		const isNotBoolean = typeof px != 'boolean';

		if ((px == true || isNotBoolean) && this.instantiatorVisible) {
			finalHeight += TodoItem.taskHeight;
		}

		if (px == true) {
			finalHeight += this.height;
		} else if (px == false) {
			finalHeight += TodoList.listHeight - (TodoList.ListGap);
		} else if (px && isNotBoolean) {
			this.height += px;
			finalHeight += this.height;
		}

		if (!t) t = Math.min(.45, Math.abs(lastHeight - finalHeight) / TodoList.speedCollapse);

		this.renderer.setStyle(
			this.resizable.nativeElement,
			'transition',
			`height ${t}s ease`
		);

		this.renderer.setStyle(this.resizable.nativeElement, 'height', `${finalHeight}px`);

        return t;
	};

	setInstantiatorVisibility(visible: boolean) {
		this.instantiatorVisible = visible;
		this.renderer.setStyle(
			this.instantiator.nativeElement,
			'display',
			visible ? 'block' : 'none'
		);
	}

    pushSplice = (task : TodoTask | EmptyTask, option : 1 | -1, ignoreHeight? : boolean) => {
        if (option == 1) this.items.push(task); else this.items.splice(this.items.indexOf(task), 1);
        if (!ignoreHeight) this.setHeight(TodoItem.taskHeight * option)
    }

	newTask = () => {
		if (this.emptyTask == null) {
			this.emptyTask = this.itemFactory.createComponent(EmptyTask, {
				index: 0,
			}).instance;
			this.pushSplice(this.emptyTask, 1, true);
		}

		this.setInstantiatorVisibility(false);
		const newTask : ComponentRef<TodoTask> = this.itemFactory.createComponent(TodoTask);

		newTask.instance._init_(this, newTask.hostView); // initialize with parent instance
	};
}
