const months = require('../../utils/DaysMonths.json').Month;

export default class ScheduleDate {
    currentDate: Date = new Date();
	currentDay : number;

	weekMonday_Year: number;
	weekMonday_Month: number;
	weekMonday_Date: number;

	currentYear: number;
	currentMonth: string;

    constructor() {
        this.currentDay =
            (this.currentDate.getDay() == 0 && 7) || this.currentDate.getDay();
    
        const weekMonday = new Date(
            this.currentDate.getFullYear(),
            this.currentDate.getMonth(),
            this.currentDate.getDate() - this.currentDay + 1
        );
    
        this.weekMonday_Year = weekMonday.getFullYear();
        this.weekMonday_Month = weekMonday.getMonth();
        this.weekMonday_Date = weekMonday.getDate();
        
        this.currentYear = this.currentDate.getFullYear();
        this.currentMonth = months[this.currentDate.getMonth()];
    }
}