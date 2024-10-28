import { Component, ElementRef } from '@angular/core';
import { SelectionList } from '../Selection/SelectionList.component';
import { TodoItem } from '../Task/TodoItem.component';

const monthsDays = require('../../../utils/DaysMonths.json');

@Component({
	selector: 'date-selector',
	styles: [
		`
			:host {
				height: ${TodoItem.taskEditHeight / TodoItem.numOptions}px;
				width: 105%;
				grid-template-columns: 40% 30% 30%;
				transform: translateX(-2.5%);
				overflow: visible;
				z-index: 50;
				position: relative;
			}
		`,
	],
	template: `
		<selection-list
			[id]="'Day'"
			[selectionItems]="Days"
			[onSelection]="onSelection"
			[selectedItemIndex]="DayIndex"
		/>
		<selection-list
			[id]="'Month'"
			[selectionItems]="Months"
			[onSelection]="onSelection"
			[selectedItemIndex]="MonthIndex"
		/>
		<selection-list
			[id]="'Year'"
			[selectionItems]="Years"
			[onSelection]="onSelection"
			[selectedItemIndex]="0"
		/>
	`,
	standalone: true,
	imports: [SelectionList],
})
export class DateSelector {
	date = new Date();

    value! : string;

	// current day, month and year (constants)
    Date!: number;
	Day!: string;
	Month!: string;
	Year!: string;

	// selected value through the selectors
	selectedMonth!: string;
	selectedYear!: string;
    selectedDay!: string;

	currentMonthIndex!: number;

	DayIndex: number = 0;
	MonthIndex: number = 0;

	// selected range of days, months and years
	Days!: any[];
	Months!: any[];
	Years: any[] = [];

	// next few days / months (after current date)
	// years always remain the same
	nextDays: any[] = [];
	nextMonths: any[] = [];

	AllMonths: any[] = [];

	minDayIndex!: number; // minimum day on nextDays

	hasSelectedToday: boolean = true; // used to correlate with the time selector

	constructor(public elementRef: ElementRef) {}

	ngOnInit() {
		const currentDate = this.date.getDate();
		this.Date = currentDate;

		const currentDayIndex = this.date.getDay();
		const currentDay = monthsDays.Day[currentDayIndex];

		const currentMonthIndex = this.date.getMonth();
		const currentMonth = monthsDays.Month[currentMonthIndex];

		const currentYear = this.date.getFullYear();
		this.setNextYears(currentYear); // used by template to render next few years

		this.Month = currentMonth;
		this.selectedMonth = currentMonth;
		this.setNextMonths(currentMonthIndex);
		this.currentMonthIndex = currentMonthIndex;

		this.Day = DateSelector.toDateDayString(currentDay, currentDate);
        this.selectedDay = this.Day;

		this.MonthIndex = currentMonthIndex;
		this.DayIndex = currentDate;

		// by default, we select the next few days and months after current date
		this.Days = this.nextDays;
		this.minDayIndex = this.date.getDate();
		this.Months = this.nextMonths;

		this.Year = currentYear.toString();

		this.setNextDays(
			new Date(currentYear, currentMonthIndex, 1).getDay(),
		);
		this.selectedYear = this.Year;

        this.updateValue();
	}

	setNextYears(currentYear: number) {
		for (let i = 0; i < 10; i++)
			this.Years.push((currentYear + i).toString());
	}

	setNextMonths(currentMonthIndex: number) {
		for (let i = 0; i < monthsDays.Month.length; i++) {
            const month = monthsDays.Month[i].substring(0, 3);
			this.nextMonths.push(i < currentMonthIndex ? null : month);
			this.AllMonths.push(month);
		}
	}

	setNextDays(currentDayIndex: number) {
		const daysThisMonth = new Date(
			Number.parseInt(this.Year),
			this.currentMonthIndex,
			0
		).getDate();

		let day_Index = currentDayIndex;

		for (let i = 1; i <= daysThisMonth + 1; i++) {
			const correspondingDay = monthsDays.Day[day_Index];
			this.nextDays.push(i >= this.Date ? correspondingDay + ', ' + i : null);

			day_Index++;
			if (day_Index > 6) day_Index = 0;
		}
	}

	static toDateDayString(day: string, dayIndex: number) {
		return day + ', ' + dayIndex;
	}

    static toDate(s : string) {
        return s.split(', ')[1];
    }

	getAllDaysOfMonth(numDaysThisMonth: number, firstDay: number) {
		let day_Index = firstDay;
		const days = [];

		for (let date = 1; date <= numDaysThisMonth; date++) {
			const day = monthsDays.Day[day_Index];
			days.push(DateSelector.toDateDayString(day, date),);

			day_Index++;
			if (day_Index > 6) day_Index = 0;
		}

		return days;
	}

	setDaysOfMonth() {
		const newDate = new Date(
			Number.parseInt(this.selectedYear),
			this.currentMonthIndex + 1,
			0
		);
		const monthStart = new Date(
			Number.parseInt(this.selectedYear),
			this.currentMonthIndex,
			1
		);

		this.Days = this.getAllDaysOfMonth(
			newDate.getDate(),
			monthStart.getDay()
		);
	}

    updateValue = () => {
        this.value = `${(this.MonthIndex + 1).toString()}/${DateSelector.toDate(this.selectedDay)}/${this.selectedYear}`;  
    }

	onSelectionParams = {
		Year: (selection: string, i: number) => {
			// if year is changed, we change the selection of months
			this.selectedYear = selection;

			if (this.Year == selection) {
				// if the current year is the same as the selection, we display the next few months
				this.Months = this.nextMonths;

				const selectedMonthIndex = monthsDays.Month.indexOf(
					this.selectedMonth
				);
				const monthIndex = monthsDays.Month.indexOf(this.Month);

				if (selectedMonthIndex < monthIndex) {
					// selected month is set to today
					this.selectedMonth = this.Month;
				}

				if (this.selectedMonth == this.Month) {
					// same month and year so next few days provided and changed to first day (today)
					this.Days = this.nextDays;
					this.minDayIndex = this.date.getDate();
					return;
				}
			} else {
				// else we display the whole set of months available in any other year
				this.Months = this.AllMonths;
			}

			this.minDayIndex = 0;
			this.setDaysOfMonth();
		},

		Month: (selection: string, i: number) => {
			this.currentMonthIndex = monthsDays.Month.indexOf(selection);
			this.selectedMonth = selection;

			this.MonthIndex = i;

			if (
				this.selectedMonth == this.Month &&
				this.selectedYear == this.Year
			) {
				// same month and year so next few days provided
				this.Days = this.nextDays;
				this.minDayIndex = this.date.getDate();
			} else {
				this.minDayIndex = 0;
				this.setDaysOfMonth();
			}
		},

		Day: (selection: string, i: number) => {
			this.DayIndex = i;
            this.selectedDay = selection;
		},
	};

	onSelection = (
		selectionType: 'Year' | 'Month' | 'Day',
		selection: string,
		i: number
	) => {
		if (selectionType in this.onSelectionParams)
			this.onSelectionParams[selectionType](selection, i);

		// clamp date
		this.DayIndex = Math.min(
			Math.max(this.DayIndex, this.minDayIndex),
			this.Days.length - 1
		);

		this.hasSelectedToday =
			this.selectedMonth == this.Month && this.selectedYear == this.Year;

        this.updateValue();
	};
}
