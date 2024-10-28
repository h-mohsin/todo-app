// import { TodoList } from "../home/todo/TodoList.component";
// import { TodoItem } from "../home/todo/TodoItem.component";
// import { EmptyTask, TodoTask } from "../home/todo/TodoTask.component";

// export default class DraggableList {
//     parent! : TodoList;
//     item! : TodoTask;
//     tradeItems : boolean = false;

//     itemsHolder! : HTMLElement;
//     allitems! : (TodoTask | EmptyTask)[];

//     grandParentsChildren! : TodoList[];
    
//     currentIndex! : number;
//     isHoveringOvertaskList: boolean = true;

//     netIndex: number = -1;
//     expanded: (TodoTask | EmptyTask)[] = [];

//     last_i!: number;
//     current_i!: number; 

//     len! : number; // uses length of current list being hovered over\

//     lastMouseX : number = 0;
//     lastMouseY : number = 0;

//     currentMouseX : number = 0;
//     currentMouseY : number = 0;

//     currentListElement! : HTMLElement;

//     chosenList! : TodoList;

//     // dependant on item trade
//     currentListIndex! : number;
//     currentListOuterBounds!: DOMRect;
//     currentListBounds!: DOMRect;

//     super = (item : TodoTask, parent : TodoList, tradeItems? : boolean) => {
//         this.parent = parent;
//         this.item = item;

//         if (tradeItems) this.tradeItems = true;

//     }

//     update = () => {
//         // these variables would change when scrolling
//         this.currentListBounds = this.currentListElement.getBoundingClientRect();
//         this.currentListOuterBounds =
//             this.chosenList.hostElement.getBoundingClientRect();
//     };

//     contract = () => {
//         while (this.expanded.length > 0) {
//             const item = this.expanded.pop();
//             if (item != undefined) {
//                 item.expandForEmpty = false;
//             }
//         }
//     };
    
// 	mouseDown = (e: MouseEvent, tempTask : TodoItem) => {
//         const allitems = this.item.parent.items;

//         this.grandParentsChildren = this.item.parent.parent.items;
        
// 		this.currentIndex = this.item.parent.itemFactory.indexOf(this.item.view);
// 		this.isHoveringOvertaskList: boolean = true;

// 		tempTask.text = this.item.text;

// 		const taskElement = this.item.elementRef.nativeElement;
// 		const taskDimensions = taskElement.getBoundingClientRect();

// 		const itemstartX = taskDimensions.left;
// 		const itemstartY = taskDimensions.top;

// 		const difX = itemstartX - e.x;
// 		const difY = e.y - itemstartY;

// 		let netIndex: number = -1;
// 		let expanded: (TodoTask | EmptyTask)[] = [];

// 		let last_i: number = 0; // reset
// 		let current_i: number = currentIndex; // reset

// 		let len = this.item.parent.itemFactory.length; // uses length of current list being hovered over\

// 		let lastMouseX: number = 0;
// 		let lastMouseY: number = 0;

// 		let currentMouseX: number = 0;
// 		let currentMouseY: number = 0;

// 		this.currentListElement = this.item.parent.itemsHolder.nativeElement;

// 		let chosenList! : TodoList;

//         // dependant on item trade
//         let currentListIndex! : number;
// 		let currentListOuterBounds!: DOMRect;
// 		let currentListBounds!: DOMRect;

// 		const mouseMove = (e: Event) => {
// 			lastMouseX = currentMouseX;
// 			lastMouseY = currentMouseY;

// 			currentMouseX = e instanceof MouseEvent ? e.x : lastMouseX;
// 			currentMouseY = e instanceof MouseEvent ? e.y : lastMouseY;

// 			if (currentMouseX == null) return; // it could be equal to lastMouseX on first few render calls

// 			if (
// 				currentMouseY > currentListOuterBounds.bottom &&
// 				currentListIndex + 1 < grandParentsChildren.length
// 			) {
// 				this.switchitems(1);
// 			} else if (
// 				currentMouseY < currentListOuterBounds.top &&
// 				currentListIndex - 1 >= 0
// 			) {
// 				this.switchitems(-1);
// 			}

// 			const currentY = currentMouseY - difY;
// 			const currentX = currentMouseX + difX;

// 			this.setTempTaskPosition(currentX, currentY);

// 			last_i = current_i;
// 			current_i = Math.floor(
// 				(currentY - currentListBounds.top) / TodoItem.taskHeight
// 			);

// 			if (last_i != current_i) {
// 				if (
// 					current_i < len &&
// 					current_i >= 0 &&
// 					((isHoveringOvertaskList &&
// 						current_i != currentIndex &&
// 						current_i != currentIndex - 1) ||
// 						!isHoveringOvertaskList) &&
// 					current_i != netIndex
// 				) {
// 					this.contract();

// 					const taskToExpand = chosenList.items[current_i];

// 					taskToExpand.expandForEmpty = true;
// 					expanded.push(taskToExpand);

// 					netIndex = current_i;
// 				} else {
// 					netIndex = -1;
// 					this.contract();
// 				}
// 			}
// 		};

//         const mouseUp = () => {
// 			this.item.renderer.setStyle(
// 				tempTask.elementRef.nativeElement,
// 				'display',
// 				'none'
// 			);

// 			if (netIndex != -1) {
// 				this.item.parent.itemFactory.detach(currentIndex);
// 				const item = allitems[currentIndex];
// 				expanded.push(item);

// 				allitems.splice(currentIndex, 1);

//                 let finalIndex! : number;

//                 if (isHoveringOvertaskList) {
//                     finalIndex = netIndex > currentIndex ? netIndex : netIndex + 1;
//                 } else {
//                     finalIndex = netIndex + 1;
//                     this.item.parent = chosenList;
//                 }

// 				chosenList.itemFactory.insert(this.item.view, finalIndex);
// 				chosenList.items.splice(finalIndex, 0, this.item);
// 			}

// 			this.item.renderer.setStyle(
// 				taskElement,
// 				'filter',
// 				'none'
// 			);

// 			document.removeEventListener('mousemove', mouseMove);

// 			setTimeout(() => {
// 				this.contract();
// 			}, 10);

// 			document.removeEventListener('mouseup', mouseUp);
// 		};

// 		mouseMove(e);

// 		document.addEventListener('mousemove', mouseMove);
// 		document.addEventListener('mouseup', mouseUp);
// 	};

//     setTempTaskPosition = (x: number, y: number) => {
//         this.item.renderer.setStyle(
//             this.tempTask.elementRef.nativeElement,
//             'top',
//             y + 'px'
//         );
//         this.item.renderer.setStyle(
//             tempTask.elementRef.nativeElement,
//             'left',
//             x + 'px'
//         );
//     };

//     switchitems = (dir: 1 | -1) => {
//         this.chosenList = grandParentsChildren[currentListIndex + dir];
//         this.currentListElement = this.chosenList.itemsHolder.nativeElement;
//         this.len = chosenList.itemFactory.length;

//         this.last_i = 0;
//         this.current_i = 0;
//         this.netIndex = -1;

//         this.currentListIndex += dir;

//         this.update();

//         if (this.chosenList == this.item.parent) this.isHoveringOvertaskList = true;
//         else this.isHoveringOvertaskList = false;
//     };
// }