import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	HostBinding,
	Input,
	Renderer2,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { ScheduleBox } from './ScheduleBox.component';
import { ScheduleContainer } from './Schedule.component';
import { Time } from '../../utils/Time';
import { CommonModule } from '@angular/common';
import { TaskService } from '../TaskService';

const scheduleColors = require('../../utils/ScheduleColors.json');

const daysAndMonths = require('../../utils/DaysMonths.json');
const days = daysAndMonths.Day,
	months = daysAndMonths.Month;

interface TodosData {
	Tasks: (string | number)[][];
	ZIndex: number;
	MultipleX: number;
    MultipleY: number;
	Start: number;
	End: number;
	Time: string;

    lastAdded : TodosData | null;
    node : ScheduleNode;
}

class ScheduleNode {
    id : number;
    parent : ScheduleNode | null;

    ended : boolean = false;
    
    constructor(id : number, parent : ScheduleNode | null) {
        this.id = id;
        this.parent = parent;
    }
}

@Component({
	selector: 'calendar',
	styles: [
		`
			:host {
				position: absolute;
				height: 100%;
				width: 100%;
				grid-template-rows: 150px auto;
				transition: all;
				display: grid;
				padding: var(--components-padding-y-header)
					var(--components-padding-x) var(--components-padding-y)
					var(--components-padding-x);
			}
		`,
	],
	template: `
		<div class="w-full h-full grid {{OneDayInterval ? 'grid-cols-[9%91%]' : 'grid-cols-[9%13%13%13%13%13%13%13%]'}}">
			<div class="w-full h-[150px] min-w-[50px]"></div>
			@for (_ of [].constructor(OneDayInterval ? 1 : 7); track $index) {
			<div
				class="w-full h-[150px] px-[2vw] py-[1vh] grid grid-rows-[50%50%] "
				style="opacity: {{
					$index == currentDay - 1 && highlightDate == true ? 1 : 0.4
				}}"
			>
				<h1
					class="relative text-black mx-auto top-[100%] translate-y-[-100%] h-fit"
				>
					{{ GetDate($index).getDate() }}
				</h1>

				<div class="grid grid-rows-[1vh1vh]">
					<h5 class="text-black mx-auto text-center">
						{{ days[(OneDayInterval ? parent.offsetFromLocalMonday : $index) >= 6 ? 0 : (OneDayInterval ? parent.offsetFromLocalMonday : $index) + 1] }}
					</h5>

					<h5 class="text-black text-center">|</h5>
				</div>
			</div>
			}
		</div>

		<div
			class="relative grid grid-cols-1 grid-rows-1 w-full h-full overflow-y-auto overflow-x-hidden"
			style="scrollbarGutter: stable"
		>
			<div
				class="absolute w-full h-full grid grid-cols-[100%] pl-[9%] pt-3"
				style="gridTemplateRows: repeat({{
					hoursUntilDayEnd - 1
				}}, 80px)"
			>
				@for (i of [].constructor(hoursUntilDayEnd); track $index) { @if
				($index + earliestNumericHour - 1 == currentNumericHourIndex) {
				<hr class=" border-[var(--primary-contrast)] border-1" />
				} @else {
				<hr />
				} }
			</div>
			<div
				class="absolute w-full h-full grid {{OneDayInterval ? 'grid-cols-[9%91%]' : 'grid-cols-[9%13%13%13%13%13%13%13%]'}} pt-3"
			>
				<div
					class="w-1/2 h-full grid overflow-visible mx-auto min-w-[50px]"
					style="gridTemplateRows: repeat({{
						hoursUntilDayEnd-1
					}}, 80px)"
				>
					@for (_ of [].constructor((25 - (earliestNumericHour - 1)));
					track $index) {
					<h4
						class="tabular-nums text-right h-fit w-full translate-y-[-50%]"
						style="color: {{
							$index + earliestNumericHour - 1 == currentNumericHourIndex
								? 'var(--primary-contrast-darker)'
								: 'black'
						}}"
					>
						{{ TimeToString($index + earliestNumericHour - 1) }}
					</h4>
					}
				</div>

				<ng-container #scheduleFactory />

				@for (id of objectKeys(todos); track $index) {
				<div
					class="w-full h-full grid"
					style="gridTemplateRows: repeat({{
						hoursUntilDayEnd-1
					}}, 80px)"
				>
					@for (data of todos[id]; track $index) {
					<schedule-box
						#schedule_box
						style="gridRowStart: {{
							data.Start - earliestNumericHour
						}}; gridRowEnd: {{
							data.End - earliestNumericHour
						}}; grid-column: 1; z-index: {{
							data.ZIndex
						}}; padding: {{ (data.MultipleY + 1) * 5 }}px {{ (data.MultipleX + 1) * 5 }}px"
						[desc]="
							data.Tasks.length > 1
								? null
								: data.Tasks[0][0].toString()
						"
						[label]="data.Time"
						[color]="
							scheduleColors[
								(data.End - data.Start).toString()
							] || '#ffffff'
						"
						[multiple]="data.Tasks.length > 1 ? true : false"
					/>
                    
                    @if (data.Tasks.length > 1) {
                        <ng-container *ngIf="schedule_box.multipleEnabled">

                            @for (task of data.Tasks; track $index) {
                                <schedule-box
                                    style="gridRowStart: {{
                                        data.Start - earliestNumericHour
                                    }}; gridRowEnd: {{
                                        task[2] - earliestNumericHour
                                    }}; grid-column: 1; 
                                    zIndex: {{$index + 100}};
                                    padding: {{ ($index + 1) * 50 }}px {{ ($index + 1) * 5 }}px 5px
                                    "
                                    [desc]="
                                        data.Tasks.length > 1
                                            ? null
                                            : task[0].toString()
                                    "
                                    [label]="task[1].toString()"
                                    [color]="
                                        scheduleColors[
                                            (task[2] - data.Start).toString()
                                        ] || '#ffffff'
                                    "
                                />
                            }
                        </ng-container>
                    }
					}
				</div>
				}
			</div>
		</div>
	`,
	standalone: true,
	imports: [ScheduleBox, CommonModule],
})
export class Calendar {
	scheduleColors = scheduleColors;

	@ViewChild('schedule_factory', { read: ViewContainerRef })
	scheduleFactory!: ViewContainerRef;

	days = days;

	@Input() parent!: ScheduleContainer;
	@Input() isSecondary!: boolean;

	@HostBinding('class.swipe_left') translateLeft: boolean = false;
	@HostBinding('class.swipe_right') translateRight: boolean = false;
	@HostBinding('class.swipe_left_secondary') translateLeftSecondary: boolean =
		false;
	@HostBinding('class.swipe_right_secondary')
	translateRightSecondary: boolean = false;

    OneDayInterval: boolean = false;

	// WARNING: currentDay ranges from 0 - 7 (Mon - Sun)
	currentDay!: number; // used for updating the current day highlight ONLY

	weekMonday!: Date;
	mondayMonthIndex!: number;
	mondayMonth!: string;
	mondayYear!: number;
	mondayDate!: number;

	currentNumericHourIndex!: number;
	earliestNumericHour!: number;
	hoursUntilDayEnd!: number;

	scheduleBoxes: ScheduleBox[] = [];

	@Input() highlightDate: boolean = false;

	todos!: any;

	constructor(
		public elementRef: ElementRef,
		private cdRef: ChangeDetectorRef,
		private renderer: Renderer2,
        private ts : TaskService
	) {}

	ngOnInit() {
		if (this.isSecondary)
			this.renderer.setStyle(
				this.elementRef.nativeElement,
				'display',
				'none'
			);

		const currentNumericHour = this.parent.date.currentDate.getHours();

		this.currentDay = this.parent.date.currentDay;
		this.weekMonday = this.parent.weekMonday;

		this.update();
		this.currentNumericHourIndex =
			currentNumericHour - this.earliestNumericHour + 1;

        this.ts.getTasks().subscribe(() => {
            this.update();
        })

		this.cdRef.detectChanges();
	}

	update() {
		this.weekMonday = this.parent.weekMonday;

		this.mondayYear = this.weekMonday.getFullYear();
		this.mondayMonthIndex = this.weekMonday.getMonth();
		this.mondayMonth = months[this.mondayMonthIndex];
		this.mondayDate = this.weekMonday.getDate();

		[this.earliestNumericHour, this.todos] = this.getData();
		this.hoursUntilDayEnd = 24 - (this.earliestNumericHour - 1) + 1;
	}

    OneDayAtATime = (enabled : boolean = false) => {
        
    }

	private getData = (): [
		earliestTodo: number,
		{ [key: string]: TodosData[] | null }
	] => {
		const startDay = this.mondayDate;

		const data: { [key: string]: TodosData[] | null } = {};
		let earliestTodo = 24;
		let zIndex = 0;

		for (let i = this.OneDayInterval ? this.parent.offsetFromLocalMonday : startDay; i < (this.OneDayInterval ? this.parent.offsetFromLocalMonday + 1 : startDay + 7); i++) {
			const id = new Date(
				this.mondayYear,
				this.mondayMonthIndex,
				i
			).toLocaleDateString();

			const dayTodos = this.ts.getTasks().getValue()[id];

			if (dayTodos == null) {
				data[id] = null;
				continue;
			}

			const thisDayTodos: TodosData[] = [];
			
            let numPending : number = 0;
            let top : TodosData | null = null;

            let nodeId : number = 0;
            let lastNode : ScheduleNode | null = null,
                currentNode : ScheduleNode | null = null;

            let lastAdded : TodosData | null = null;
            let newTaskData : TodosData | null = null;
            
			const toComplete: { [key: string]: TodosData[] } = {};

			for (let i = 0; i < 24; i++) {
				const startTime = i.toString();

                if (toComplete[startTime]) {
					// these events are ending at this time

                    let j = 0;

					for (const data of toComplete[startTime]) {
                        data.MultipleY = j;
                        j++;
                        
						thisDayTodos.push(data);
                        data.node.ended = true;

                        if (data == top) {
                            let curr = data.node;

                            numPending--;

                            while (curr.parent != null && curr.parent.ended == true) {
                                curr = curr.parent;
                                numPending--;
                            }
                        }


                        if (data == top) {
                            top = top.lastAdded;
                        }
					}

					delete toComplete[startTime];
				}

				if (dayTodos[startTime]) {
					const start = Number.parseInt(startTime);

					let numTasks = dayTodos[startTime].length;

                    lastNode = currentNode;
                    
                    while (lastNode != null && lastNode.ended == true) {
                        lastNode = lastNode.parent;
                    }

                    currentNode = new ScheduleNode(nodeId++, lastNode);

                    lastAdded = newTaskData;
					newTaskData = {
						Tasks: [],
						ZIndex: zIndex++,
						MultipleX: numPending++,
                        MultipleY: 0,
						Start: start + 2,
						End: start,
						Time: Time.TimeToString(i),
                        lastAdded : lastAdded,
                        node : currentNode
					};

                    top = newTaskData;

					let end!: number;

					for (const info of dayTodos[startTime]) {
						const [desc, endTime] = info;

						end = Time.StringToTime(endTime, true) as number;

						if (start < earliestTodo) {
							earliestTodo = start;
						}

						newTaskData.Tasks.push([desc, Time.TimeToString(i), end + 2]);
					}

					if (numTasks > 1) {
						end = start + 1;
					}

					if (toComplete[end] == null) {
						toComplete[end] = [];
					}

					toComplete[end].push(newTaskData);
					newTaskData.End = end + 2;
				}
			}

			data[id] = thisDayTodos;
		}

		if (earliestTodo == 24) earliestTodo = 1;

		return [earliestTodo, data];
	};

	GetDate(num: number) {
		return new Date(
			this.mondayYear,
			this.mondayMonthIndex,
			this.mondayDate + (this.OneDayInterval ? this.parent.offsetFromLocalMonday : num)
		);
	}

	TimeToString(n: number): string {
		return Time.TimeToString(n);
	}

	objectKeys(obj: Object): Array<any> {
		return Object.keys(obj);
	}
}
