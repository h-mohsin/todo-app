import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SelectionList } from '../Selection/SelectionList.component';
import { DateSelector } from './DateSelection.component';
import { TodoItem } from '../Task/TodoItem.component';

@Component({
	selector: 'time-selector',
	styles: [
		`
			:host {
                height: ${TodoItem.taskEditHeight / TodoItem.numOptions}px;
                transform: translateX(-2.5%);
                width: 105%;
                grid-template-columns: 40% 30% 30%;
                overflow: visible;
                z-index: 50;
                position: relative;
			}
		`,
	],
	template: `
		<selection-list
			[id]="'Hour'"
			[selectionItems]="date.hasSelectedToday == true && Hours || fullHours"
			[onSelection]="onSelection"
			[selectedItemIndex]="startTime != null ? max(HourIndex, startTime.HourIndex) : HourIndex"
			[scrollEvent]="onScroll"
            [onSelectionHover]="onSelectionHover"
		/>
		<selection-list
			[id]="'Minute'"
			[selectionItems]="Minutes"
			[onSelection]="onSelection"
			[selectedItemIndex]="startTime != null ? max(MinuteIndex, startTime.MinuteIndex) : MinuteIndex"
		/>
		<selection-list
			#timeofday
			[id]="'TimeOfDay'"
			[selectionItems]="TimesOfDay"
			[onSelection]="onSelection"
			[selectedItemIndex]="startTime != null ? max(TimeOfDayIndex, startTime.TimeOfDayIndex) : TimeOfDayIndex"
			[inputDisabled]="true"
		/>
	`,
	standalone: true,
	imports: [SelectionList],
})
export class TimeSelector {
	@ViewChild('timeofday') timeOfDay!: SelectionList;
    @Input() date! : DateSelector;
    @Input() startTime! : TimeSelector;

    value!: string;

	currentDate: Date = new Date();

	currentHours: number = this.currentDate.getHours();
	currentMinutes: number = this.currentDate.getMinutes();

	Hour: string = this.currentHours.toString();
	Minute: string = ((this.currentMinutes - (this.currentMinutes % 5)) + 5).toString();

	SelectedHour!: string;
	SelectedMinute!: string;

	Hours: any[] = [];
	Minutes: any[] = [];

	fullHours: any[] = [];
	nextHours: any[] = [];
	fullMinutes: any[] = [];
	nextMinutes: any[] = [];

	TimesOfDay: string[] = ['AM', 'PM'];

	HourIndex: number = 0;
	MinuteIndex: number = 0;
	TimeOfDayIndex!: number;

	indexOfMidday: number = 12;
	isAfterMidday: boolean = false;

    constructor(public elementRef : ElementRef) {}

	ngOnInit() {
		this.SelectedHour = this.Hour;
		this.SelectedMinute = (this.currentMinutes < 10) ? "0" + this.Minute : this.Minute;

		this.setAllHours();
		this.setAllMinutes();

		this.Hours = this.nextHours;
		this.Minutes = this.nextMinutes;

        this.HourIndex = this.currentHours;
        this.MinuteIndex = Number.parseInt(this.SelectedMinute) / 5;

		if (this.currentHours > 12) this.TimeOfDayIndex = 1;
		else this.TimeOfDayIndex = 0;

        this.updateValue();
	}

	setAllHours() {
		for (let i = 0; i < 24; i++) {
			let hour: string | number = i % 12;
			hour = ((hour == 0 && 12) || hour).toString();

            this.nextHours.push((i > this.currentHours || (i == this.currentHours && this.currentMinutes < 55)) ? hour : null);
			this.fullHours.push(hour);
		}
	}

    updateValue() {
        this.value = `${this.SelectedHour}:${this.SelectedMinute} ${this.TimesOfDay[this.TimeOfDayIndex]}`
    }

	setAllMinutes() {
		let nearestMinute =
            this.currentMinutes - (this.currentMinutes % 5) + 5;

        if (nearestMinute == 60)
            nearestMinute = 0;

		for (let i = 0; i < 60; i += 5) {
			let min: string | number = i;
			min = (min < 10 && '0' + min) || min.toString();

            this.nextMinutes.push(i >= nearestMinute ? min : null);
			this.fullMinutes.push(min);
		}
	}

	onScroll = (event: Event) => {
		const element = event.target as HTMLElement;
        const dist = this.indexOfMidday *
        (SelectionList.SELECTION_ELEMENT_HEIGHT +
            SelectionList.SELECTION_GRID_GAP)

		const scrollingAfterMidday =
			element.scrollTop >= dist - element.offsetHeight / 2 || element.scrollTop >= dist - element.offsetHeight; 

		if (!this.isAfterMidday && scrollingAfterMidday) {
			this.isAfterMidday = true;
			this.TimeOfDayIndex = 1;
		} else if (this.isAfterMidday && !scrollingAfterMidday) {
			this.isAfterMidday = false;
			this.TimeOfDayIndex = 0;
		}
	};

	onSelectionParams = {
		Hour: (selection: string, i : number) => {
			this.SelectedHour = selection;

			if (this.Hour == this.SelectedHour) {
				this.Minutes = this.nextMinutes;
                this.SelectedMinute = this.Minute;
			} else {
				this.Minutes = this.fullMinutes;
			}

            this.setIndexOfMidday(i);
		},

        Minute: (selection : string, i : number) => {
            this.SelectedMinute = selection;
        }
	};

    setIndexOfMidday(i : number) {
        if (i >= this.indexOfMidday) 
            this.TimeOfDayIndex = 1;
        else 
            this.TimeOfDayIndex = 0;
    }

    onSelectionHover = (hovering : boolean, i : number) => {
        if (hovering) {
            this.setIndexOfMidday(i);
        }
    }

	onSelection = (selectionType: 'Hour' | 'Minute', selection: string, i : number) => {
		if (selectionType in this.onSelectionParams)
			this.onSelectionParams[selectionType](selection, i);

        this.updateValue();
	};

    max(num1 : number, num2 : number) : number {
        return Math.max(num1, num2);
    }
}
