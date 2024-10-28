import {
	Directive,
	ElementRef,
	Host,
	HostListener,
	Optional,
	Renderer2,
} from '@angular/core';
import { TodoItem } from './Task/TodoItem.component';
import { EmptyTask, TodoTask } from './Task/TodoTask.component';
import { TodoList } from './TodoList.component';

@Directive({
	selector: '[isDraggable]',
	standalone: true,
})
export class isDraggable {
    allowTrade : boolean = true;
    draggableElement! : TodoTask | TodoList;

	constructor(
		@Optional() @Host() private isTask: TodoTask,
        @Optional() @Host() private isList: TodoList,
		public elementRef: ElementRef,
	) {
        this.draggableElement = this.isTask || this.isList;
    }

    checkedIfExpanded: boolean = false;

    ngAfterViewInit() {
        if (this.draggableElement.parent) {
            new Promise((resolve) => {
                const waitForDraggable = () => {
                    if (this.draggableElement.draggable) return resolve(true);
                    setTimeout(() => waitForDraggable(), 30);
                }
    
                waitForDraggable();
            }).then(() => {
                this.draggableElement.draggable.nativeElement.addEventListener('mousedown', (e : MouseEvent) => {
                    if (this.draggableElement) {            
                        isDraggable.onMouseDown(e, this);
                    }
                })
            })
        }
    }

    static onMouseDown = (e: MouseEvent, that : any) => {
        const draggable = that.draggableElement;
        const draggableParent = draggable.parent;
        const draggableParentFactory = draggableParent.itemFactory;

        const tempTask = draggableParent.temp;
		const itemsHolder = draggableParent.itemsHolder.nativeElement;
		const allitems = draggableParent.items;

		let tradeChildren : any[] | null = null;

        if (draggable.allowTrade) 
            tradeChildren = draggableParent.parent.items;

		const currentIndex = draggableParentFactory.indexOf(draggable.view);
		let isHoveringOverThisList: boolean = true;

		const taskElement = draggable.elementRef.nativeElement;
		const taskDimensions = taskElement.getBoundingClientRect();

        tempTask.text = draggable.text;
        tempTask.setStyle('display', 'block');
        tempTask.setStyle('width', taskElement.offsetWidth + 'px');

		const itemstartX = taskDimensions.left;
		const itemstartY = taskDimensions.top;

		const difX = itemstartX - e.x;
		const difY = e.y - itemstartY;

		let netIndex: number = -1;
		let expanded: (TodoTask | EmptyTask)[] = [];

		const contract = () => {
			while (expanded.length > 0) {
				const task = expanded.pop();
				if (chosenList.setHeight) chosenList.setHeight(-TodoItem.taskHeight * 0.75); // 
				if (task != undefined) {
					task.expandForEmpty = false;
				}
			}
		};

		const setTempTaskPosition = (x: number, y: number) => {
            tempTask.setStyle('top', y + 'px');
            tempTask.setStyle('left', x + 'px');
		};

		let last_i: number = 0; // reset
		let current_i: number = currentIndex; // reset

		let len = draggableParentFactory.length; // uses length of current list being hovered over

		let lastMouseX: number = 0, lastMouseY: number = 0;
		let currentMouseX: number = 0, currentMouseY: number = 0;

		let currentListElement: HTMLElement = itemsHolder;

		let chosenList = draggableParent;

		// dependant on item trade
		let currentListIndex = draggableParent.currentIndex;
		let currentListOuterBounds!: DOMRect;
		let currentListBounds!: DOMRect;

		const update = () => {
			// these variables would change whenever the lists switch 
			currentListBounds = currentListElement.getBoundingClientRect();

            if (draggable.allowTrade)
			    currentListOuterBounds =
				    chosenList.hostElement.getBoundingClientRect();
		};

        update();

		const switchitems = (dir: 1 | -1) => {
            if (tradeChildren) {
                chosenList = tradeChildren[currentListIndex + dir];
                currentListElement = chosenList.itemsHolder.nativeElement;
                len = chosenList.itemFactory.length;

                last_i = 0;
                current_i = 0;
                netIndex = -1;

                currentListIndex += dir;

                update();

                if (chosenList == draggableParent) isHoveringOverThisList = true;
                else isHoveringOverThisList = false;
            }
		};

        let checkedIfExpanded: boolean = false;

		const mouseMove = (e: Event, init? : boolean) => {
            if (!checkedIfExpanded && !init) {
                if (draggable.expanded) {
                    draggable.onExpand();
                    checkedIfExpanded = true;
                }

                if (draggable instanceof TodoTask) {
                    draggable.parent.lastTaskExpanded?.onExpand();
                } 
            }

			lastMouseX = currentMouseX;
			lastMouseY = currentMouseY;

			currentMouseX = e instanceof MouseEvent ? e.x : lastMouseX;
			currentMouseY = e instanceof MouseEvent ? e.y : lastMouseY;

			if (currentMouseX == null) return; // it could be equal to lastMouseX on first few render calls
            
            if (tradeChildren) {
                if (
                    currentMouseY > currentListOuterBounds.bottom &&
                    currentListIndex + 1 < tradeChildren.length
                ) {
                    switchitems(1);
                } else if (
                    currentMouseY < currentListOuterBounds.top &&
                    currentListIndex - 1 >= 0
                ) {
                    switchitems(-1);
                }

            }

			const currentY = currentMouseY - difY;
			const currentX = currentMouseX + difX;

			setTempTaskPosition(currentX, currentY);

			last_i = current_i;
			current_i = Math.floor(
				(currentY - currentListBounds.top) / TodoItem.taskHeight
			);

			if (last_i != current_i) {
				if (
					current_i < len &&
					current_i >= 0 &&
					((isHoveringOverThisList &&
						current_i != currentIndex &&
						current_i != currentIndex - 1) ||
						!isHoveringOverThisList) &&
					current_i != netIndex
				) {
					contract();

					const taskToExpand = chosenList.items[current_i];

					taskToExpand.expandForEmpty = true;
					expanded.push(taskToExpand);
					if (chosenList.setHeight) chosenList.setHeight(TodoItem.taskHeight * 0.75);

					netIndex = current_i;
				} else {
					netIndex = -1;
					contract();
				}
			}
		};
        
		const mouseUp = () => {
            tempTask.setStyle('display', 'none');
            
			if (netIndex != -1) {
                console.log(currentIndex);
				draggableParentFactory.detach(currentIndex);
                
				const task = allitems[currentIndex];
				expanded.push(task);
				if (chosenList.setHeight) chosenList.setHeight(TodoItem.taskHeight * 0.75);

				allitems.splice(currentIndex, 1);

				let finalIndex!: number;

				if (isHoveringOverThisList) {
					finalIndex =
						netIndex > currentIndex ? netIndex : netIndex + 1;
				} else {
					finalIndex = netIndex + 1;
					draggable.parent = chosenList;
				}

				chosenList.itemFactory.insert(draggable.view, finalIndex);
				chosenList.items.splice(finalIndex, 0, task);

                if (chosenList != draggableParent) {
                    draggableParent.setHeight(-TodoItem.taskHeight);
                    if (chosenList.setHeight) chosenList.setHeight(TodoItem.taskHeight);
                };


			}

			draggable.renderer.setStyle(taskElement, 'filter', 'none');

			document.removeEventListener('mousemove', mouseMove);

			setTimeout(() => {
				contract();
			}, 10);

			document.removeEventListener('mouseup', mouseUp);
		};

		mouseMove(e, true);

		document.addEventListener('mousemove', mouseMove);
		document.addEventListener('mouseup', mouseUp);
    }
}
