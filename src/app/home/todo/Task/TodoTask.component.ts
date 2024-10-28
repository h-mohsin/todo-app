import {
	Component,
	ElementRef,
	HostBinding,
	Input,
	Renderer2,
	ViewChild,
	ViewRef,
} from '@angular/core';
import { TodoItem } from './TodoItem.component';
import { TodoList } from '../TodoList.component';
import { CommonModule } from '@angular/common';
import {
	heightLeaveTransition,
	heightTransition,
	opacityTranslateTransition,
	opacityTranslateTransition2,
} from '../../Animations/Animations';
import {
	expandContract,
	expandContract_1,
} from '../../Animations/ExpandContract';
import {
	SelectionTemplate,
	SelectionTemplatePlain,
} from '../Selection/SelectionTemplate.component';
import { SelectionList } from '../Selection/SelectionList.component';
import { TimeSelector } from '../SelectionTypes/TimeSelection.component';
import { DateSelector } from '../SelectionTypes/DateSelection.component';
import { isDraggable } from '../isDraggable';

@Component({
	selector: 'todo-task',
	styles: [
		`
			:host {
				@apply w-full block relative h-fit;
			}
		`,
	],
	template: `
		<todo-item
			#item
			[onImageClick]="fill"
			[remove]="remove"
			[onSuccess]="onTypingFinished"
			[onTab]="onTab"
			class="block"
			[parent]="this"
		>
			<div
				#selections
				*ngIf="settingsEnabled"
				class="w-full px-5 relative opacity-0"
				style="height: 0px; transition: all 0.2s ease"
				[@opacityTranslateTransition2]="
					expanded
						? 'visible'
						: { value: 'invisible', params: { delay: 200 } }
				"
			>
				<selection-template [label]="'Date'" [parent]="this">
					<date-selector #dateSelector class="grid" />
				</selection-template>
				<selection-template [label]="'Start Time'" [parent]="this">
					<time-selector
						#timeSelector
						[date]="dateSelector"
						class="grid"
					/>
				</selection-template>
				<selection-template [label]="'End Time'" [parent]="this">
					<time-selector
						#durationSelector
						[date]="dateSelector"
						[startTime]="timeSelector"
						class="grid"
					/>
				</selection-template>
				<selection-template-plain [label]="'Repeat'">
					<selection-list
						[id]="'Repeat'"
						[selectionItems]="[
							'Never',
							'Daily',
							'Weekly',
							'Monthly'
						]"
						[onSelection]="onRepeatSelection"
						[selectedItemIndex]="0"
					/>
				</selection-template-plain>
			</div>
		</todo-item>
	`,
	standalone: true,
	imports: [
		TodoItem,
		CommonModule,
		SelectionTemplate,
		SelectionList,
		SelectionTemplatePlain,
		TimeSelector,
		DateSelector,
	],
	animations: [
		opacityTranslateTransition,
		expandContract,
		heightTransition,
		heightLeaveTransition,
		opacityTranslateTransition2,
	],
    hostDirectives: [isDraggable]
})
export class TodoTask {
	@ViewChild('item') child!: TodoItem;

	@ViewChild('selections') selections!: ElementRef;
	@ViewChild('dateSelector') dateSelector!: DateSelector;
	@ViewChild('timeSelector') timeSelector!: TimeSelector;

	view!: ViewRef;
    draggable!: ElementRef;

    allowTrade : boolean = true;

	parent!: TodoList;
	// used to create one task that is empty
	// set dynamically using viewContainer to preserve the

	settingsEnabled: boolean = false;

	taskDone: boolean = false;
	expanded: boolean = false;

	isNamed: boolean = false;

	text: string = '';
    tempTaskRef! : TodoItem;

    current : TodoTask = this;

	@HostBinding('@opacityTranslateTransition') revealChange: boolean = true;
	@HostBinding('@heightLeaveTransition') heightLeaveChange: boolean = true;
	@HostBinding('@expandContract') get expand() {
        return {
            value: this.expandForEmpty ? 'expand' : 'contract',
            params: {height: this.expandForEmpty ? TodoItem.taskHeight * 7 / 4 : TodoItem.taskHeight}
        }
	}

	expandForEmpty: boolean = false;
	currentIndex!: number;

	constructor(
		public elementRef: ElementRef,
		public renderer: Renderer2,
	) {}

	_init_ = (parent: TodoList, viewRef: ViewRef) => {
		this.parent = parent;
		this.parent.pushSplice(this, 1);
		this.currentIndex = parent.items.length - 1;

		this.view = viewRef;
	};

	onTypingFinished = (value: string) => {
		this.text = value;
		this.parent.setInstantiatorVisibility(true);
		this.parent.setHeight(true);
		this.isNamed = true;

        new Promise((resolve) => {
            const waitForDraggable = () => {
                if (this.child.draggable) resolve(true);
                setTimeout(() => waitForDraggable(), 30);
            }

            waitForDraggable();
        }).then(() => {
            this.draggable = this.child.draggable;
        })
	};

	remove = () => {
		this.parent.setInstantiatorVisibility(true);
		this.parent.pushSplice(this, -1);
		this.parent.itemFactory.remove(
			this.parent.itemFactory.indexOf(this.view)
		);

		// remove the element using viewContainer and also remove it from the items list
		// both may or may not have different indexes
	};

	fill = (element: HTMLElement) => {
		if (this.taskDone) return;

		if (this.expanded) {
			this.onExpand();
		} // done before taskDone is changed to make final changes before inaccessibility

		this.taskDone = !this.taskDone;
		this.renderer.setStyle(
			element,
			'backgroundColor',
			(this.taskDone && 'var(--primary-contrast)') || 'transparent'
		);

		setTimeout(() => {
			this.remove();
		}, 500);
	};

	onTab = (text: string) => {
		this.onTypingFinished(text);
		this.parent.newTask();
	};

	hovering: boolean = false;

	settingsAnimation: NodeJS.Timeout | null = null;

	height = TodoItem.taskEditHeight;

	onExpand = (val?: number) => {
		if (this.taskDone) return;

		this.expanded = !this.expanded;

		if (this.settingsAnimation) {
			clearInterval(this.settingsAnimation);
		}

		if (this.expanded) {
			this.height = TodoItem.taskEditHeight;
			this.settingsEnabled = true;
            this.parent.lastTaskExpanded = this;
		} else {

            if (this.parent.lastTaskExpanded == this)   
                this.parent.lastTaskExpanded = null;

			this.settingsAnimation = setTimeout(() => {
				this.settingsEnabled = false;
			}, 250);
		}

		setTimeout(() => { // next render 
			this.selections.nativeElement.style.height = this.expanded
				? TodoItem.taskEditHeight + 'px'
				: '0px';
		}, 0);

		const lastExpanded = this.parent.lastTaskExpanded;

		if (lastExpanded != null && lastExpanded != this) {
			lastExpanded.onExpand();
			this.parent.lastTaskExpanded = null;
		}

		if (this.expanded) this.parent.lastTaskExpanded = this;
		else if (lastExpanded == this && !this.expanded)
			this.parent.lastTaskExpanded = null;

		this.parent.setHeight(
			this.expanded ? val || TodoItem.taskEditHeight : -this.height,
			this.expanded ? 0.3 : 0.2
		);
	};

	updateHeight = (expandByBlock: boolean) => {
		const heightIncrease =
			(TodoItem.taskEditHeight / TodoItem.numOptions) *
			(expandByBlock ? 1 : -1);
		this.height += heightIncrease;

		this.selections.nativeElement.style.height = this.expanded
			? this.height + 'px'
			: '0px';
		this.parent.setHeight(heightIncrease, expandByBlock ? 0.3 : 0.2);
	};

	onRepeatSelection = () => {};
}

@Component({
	selector: 'todo-instantiator',
	styles: [
		`
			:host {
				@apply h-full w-full;
			}
		`,
	],
	template: `
		<todo-item [onDivClick]="onAdd" [isInstantiator]="true" class="block" />
	`,
	standalone: true,
	imports: [TodoItem],
})
export class NewTodo {
	@Input() onAdd!: (args?: any) => void;
}

@Component({
	selector: 'todo-empty',
	styles: [
		`
			:host {
				width: 100%;
				display: block;
			}
		`,
	],
	template: '',
	standalone: true,
	animations: [expandContract_1],
})
export class EmptyTask {
	@HostBinding('@expandContract_1') get expand() {
		return this.expandForEmpty ? 'expand' : 'contract';
	}
	expandForEmpty = false;
}
