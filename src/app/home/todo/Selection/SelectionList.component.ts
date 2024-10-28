import {
	Component,
	ElementRef,
	Input,
	Renderer2,
	ViewChild,
} from '@angular/core';
import { ClickOutsideModule } from 'ng-click-outside';
import { DropdownText, TextBase } from './TextBase.component';

const MAXNUMELEMENTSDROPDOWN = 5;
const SELECTION_ELEMENT_HEIGHT = 28; // px
const SELECTION_GRID_GAP = 3; // px

@Component({
	selector: 'selection-list',
	styles: [
		`
			:host {
				@apply relative h-[${SELECTION_ELEMENT_HEIGHT}px] w-full my-auto block;
			}
		`,
	],
	template: `
		<div
			#list
			(clickOutside)="hide()"
			(scroll)="
				(inputDisabled != true &&
					scrollEvent != null &&
					scrollEvent($event)) ||
					''
			"
			class="absolute grid grid-flow-row w-full overflow-x-clip overflow-y-hidden my-auto"
			style="height: {{
				heightElement.toString()
			}}px; gap: ${SELECTION_GRID_GAP}px; 
            scrollbar-width: thin; 
            scrollbar-color: revert; 
            color-scheme: dark; 
            scrollbar-gutter: stable both-edges"
		>
			@for (item of selectionItems; track item; let i = $index) { @if
			(item != null) {@if (i == selectedItemIndex) {
			<dropdown-text
				[height]="heightElement"
				#dropdown
				[reveal]="reveal"
				[defText]="item"
				(click)="updateHeight(dropdown.elementRef.nativeElement)"
				[onInit]="updateHeight"
				[disabled]="inputDisabled"
			/>
			} @else {
			<text-base
				class="inline-block {{
					inputDisabled == true ? '' : 'cursor-pointer'
				}} bg-[var(--secondary-darker)]"
				style="height: {{ heightElement.toString() }}px"
				#select
				id="{{ inputDisabled == true ? '' : 'hoverable' }}"
				[text]="item"
				(click)="selectionClicked(select, i)"
				(mouseenter)="
					onSelectionHover != null && onSelectionHover(true, i)
				"
				(mouseleave)="
					onSelectionHover != null && onSelectionHover(false, i)
				"
			></text-base>
			}}}
		</div>
	`,
	standalone: true,
	imports: [TextBase, ClickOutsideModule, DropdownText],
})
export class SelectionList {
	// used by components for estimation purposes
	static SELECTION_ELEMENT_HEIGHT = 28;
	static SELECTION_GRID_GAP = 3;

	heightElement = SELECTION_ELEMENT_HEIGHT;

	@ViewChild('list') list!: ElementRef;
	@ViewChild('dropdown') dropdown!: DropdownText;

	@Input() selectionItems!: any[];
	@Input() selectedItemIndex!: number;
	@Input() id!: string;

	@Input() onSelection!: Function;
	@Input() onSelectionHover!: Function;
	@Input() scrollEvent!: Function | null;

	@Input() inputDisabled: boolean = false;

	collapsed: boolean = true;
	listElement!: HTMLDivElement;
	currentSelected!: HTMLElement;

	constructor(public elementRef: ElementRef, private renderer: Renderer2) {}

	ngAfterViewInit() {
		this.listElement = this.list.nativeElement;
		this.renderer.setStyle(
			this.listElement,
			'height',
			`${this.heightElement}px`
		);
		this.updateHeight();
	}

	updateHeight = (nativeElement?: HTMLElement) => {
		if (nativeElement == undefined && this.dropdown != null) {
			nativeElement = this.dropdown.elementRef.nativeElement;
		}

		if (nativeElement != null) {
			// scroll the element into view
			nativeElement.scrollIntoView({ block: 'nearest', inline: 'start' });
			this.currentSelected = nativeElement;
		}
	};

	reveal = (shouldCollapse?: boolean) => {
		if (this.inputDisabled) return;

		this.collapsed =
			shouldCollapse != null ? shouldCollapse : !this.collapsed;

        // setting the overflowY, height and ZIndex of the list when revealing and unrevealing

		this.renderer.setStyle(
			this.listElement,
			'overflowY',
			(this.collapsed && 'hidden') || 'auto'
		);
		this.renderer.setStyle(
			this.listElement,
			'height',
			`${
				(this.collapsed && this.heightElement) ||
				Math.min(
					MAXNUMELEMENTSDROPDOWN,
					this.selectionItems.reduce(
						(acc, item) => acc + (item == null ? 0 : 1),
						0
					)
				) * this.heightElement
			}px`
		);
		this.renderer.setStyle(
			this.listElement,
			'zIndex',
			shouldCollapse == true ? '0' : '30'
		);
	};

	hide = () => {
		this.reveal(true);
		this.updateHeight(this.currentSelected);
	};

	selectionClicked = (selection: TextBase, i: number) => {
		if (this.inputDisabled == true) return;
        // a selection other than the main selection is clicked

		this.onSelection(this.id, selection.text, i);
		this.reveal(true);
		this.selectedItemIndex = i;
		this.updateHeight(selection.elementRef.nativeElement);
	};
}
