import {
	ChangeDetectorRef,
	Component,
	Renderer2,
	ViewChild,
} from '@angular/core';
import { Calendar } from './Calendar.component';
import { easeInOutSine, easeInOutSine_REVERSE, easeInSine, easeInSine_REVERSE, easeOutSine, easeOutSine_REVERSE } from '../../utils/Animate';
import ScheduleDate from './ScheduleDate';

const months = require('../../utils/DaysMonths.json').Month;

@Component({
	selector: 'schedule-container',
	styles: [`:host {
        height: 100%;
        width: 100%;
    }`],
	template: `
		<div class="grid grid-rows-[7%93%] w-full h-full">
			<div
				class="w-full h-1/2 grid px-[var(--components-padding-x)] my-auto"
				style="gridTemplateColumns: 350px 50px 50px auto"
			>
                <div class="my-auto h-fit grid w-full cursor-pointer transition-all hover:scale-105"
                style="grid-template-columns: fit-content(400px) 14%">
                    <h3 class="text-black my-auto w-fit">
                        {{ selectedMonth }}
                        {{ selectedYear }}&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;W{{
                            numWeeks
                        }}
                    </h3>
                    <img src="assets/dropdown_large.png" class="h-[30px] m-auto w-auto overflow-auto brightness-0"/>
                </div>
				@for (_ of [].constructor(2); track $index) {
				<img
					src="{{
						$index == 0
							? 'assets/arrow_back.png'
							: 'assets/arrow_forward.png'
					}}"
					class="w-auto h-[2rem] overflow-auto cursor-pointer m-auto"
					id="hoverable"
					(click)="onArrow($index == 1 ? 1 : -1)"
				/>
				}

                <div class="ml-auto mr-0 my-auto h-full w-[80px] {{offsetFromThisWeek == 0 ? 'bg-[#e8e8e8]' : 'bg-[var(--secondary-color)] cursor-pointer'}} rounded-xl transition-all" 
                id="{{OneDayInterval ? offsetFromGlobalMonday != 0 : offsetFromThisWeek != 0 && 'hoverable'}}"
                (click)="(OneDayInterval ? offsetFromGlobalMonday != 0 : offsetFromThisWeek != 0) ? onTodayClick() : ''">
                    <h5 class="relative h-fit w-fit m-auto translate-y-[-50%] top-[50%] font-normal {{offsetFromThisWeek == 0 && 'text-black'}}">
                        Today
                    </h5>
                </div>
			</div>
            <div class="w-full">
			<div class="h-full w-full relative grid grid-cols-1 grid-rows-1">
				<calendar
					#primaryCalendar
					[parent]="this"
					[highlightDate]="true"
				/>
				<calendar
					#secondaryCalendar
					[parent]="this"
					[isSecondary]="true"
				/>
                </div>
			</div>
		</div>
	`,
	standalone: true,
	imports: [Calendar],
})
export class ScheduleContainer {
	@ViewChild('primaryCalendar') primaryCalendar!: Calendar;
	@ViewChild('secondaryCalendar') secondaryCalendar!: Calendar;
	activeCalendar!: Calendar;

    date : ScheduleDate = new ScheduleDate();
    weekMonday!: Date;

	selectedYear!: number;
	selectedMonth!: string;
	numWeeks!: number;

	offsetFromThisWeek: number = 0;
    offsetFromGlobalMonday: number = 0;
    offsetFromLocalMonday: number = 0;
	isTransitioning: boolean = false;

	queue: number = 0;
	calendarWidth!: number;

    currentCalendarSpeed! : number;
    requestedReverse : boolean = false;

	constructor(
		private cdRef: ChangeDetectorRef,
		private renderer: Renderer2
	) {}

    // size issue of calendar width 
    // use top instead of padding 

    OneDayInterval = false;

	ngOnInit() {
		this.updateMonday(0);
		this.setDateWeek();
		this.update();
		this.cdRef.detectChanges();

        if (typeof window !== "undefined") {
            let rtime : number;
            let timeout : boolean = false;
            let delta : number = 200;
    
            const resizeend = () => {
                if (Date.now() - rtime < delta) {
                    setTimeout(resizeend, delta);
                } else {
                    timeout = false;
                    this.activeCalendar.OneDayAtATime();
                }               
            }
    
            window.addEventListener('resize',function() {
                rtime = Date.now();
                if (timeout === false) {
                    timeout = true;
                    setTimeout(resizeend, delta);
                }
            });
        }
	}

	ngAfterViewInit() {
		this.activeCalendar = this.primaryCalendar;
		this.calendarWidth =
			this.activeCalendar.elementRef.nativeElement.offsetWidth;
	}

	swapCalendars() {
		const temp = this.activeCalendar;

		this.activeCalendar = this.secondaryCalendar;
		this.secondaryCalendar = temp;
	}

	position(calendar: Calendar, dir: number) {
		calendar.elementRef.nativeElement.style.transform = `translateX(${
			100 * dir
		}%)`;
	}

    onTodayClick = () => {
        for (let i = 0; i <= (this.OneDayInterval ? Math.abs(this.offsetFromGlobalMonday) : Math.abs(this.offsetFromThisWeek)); i++) {
            this.onArrow(-Math.sign(this.offsetFromThisWeek));
        }
    }

	interpolate(primaryCalendar: Calendar, secondaryCalendar: Calendar, dir: number, i : number) : Promise<boolean> {
        return new Promise((resolve) => {
            let primary = primaryCalendar.elementRef.nativeElement;
            let secondary = secondaryCalendar.elementRef.nativeElement;
    
            let x = 0;

            let lastStyle : string | null = null;
            let currentStyle : string | null = null;
            let lastFinal = null;
            let final = x;

            let netDir = 1;

            const translate = () => {
                let s = this.currentCalendarSpeed;

                if ((((this.queue == 1 && x > this.calendarWidth / 2) || (netDir == -1 && x < this.calendarWidth / 2)) && i != 1)) {
                    s = 2;
                }

                if (this.requestedReverse) {
                    netDir = -netDir;
                    this.requestedReverse = false;
                }

                x = Math.min(Math.max((x + (20) * netDir * s), 0), this.calendarWidth);

                lastFinal = final;
                final = x;

                lastStyle = currentStyle;
                // find X such that it equals last final value 

                if (i == 1 || (netDir == -1 && this.queue <= 1)) {
                    // first in the queue
                    if ((this.queue > 1 && netDir == 1) || (netDir == -1 && this.queue < -1)) {
                        currentStyle = "In"
                        final = easeInSine(x / this.calendarWidth) * this.calendarWidth;
                    } else if (netDir == 1 || this.queue == 0) {
                        currentStyle = "InOut"
                        final = easeInOutSine(x / this.calendarWidth) * this.calendarWidth;
                    } else {
                        currentStyle = null;
                    }
                } else if ((this.queue == 1)) {
                    // last in queue
                    currentStyle = "Out"
                    final = easeOutSine(x / this.calendarWidth) * this.calendarWidth
                } else {
                    currentStyle = null;
                }

                if (lastStyle != currentStyle && lastFinal != null) {
                    if (currentStyle == "In") {
                        x = easeInSine_REVERSE(lastFinal / this.calendarWidth) * this.calendarWidth
                        final = easeInSine(x / this.calendarWidth) * this.calendarWidth;
                    } else if (currentStyle == "Out") {
                        x = easeOutSine_REVERSE(lastFinal / this.calendarWidth) * this.calendarWidth
                        final = easeOutSine(x / this.calendarWidth) * this.calendarWidth;
                    } else if (currentStyle == "InOut") {
                        x = easeInOutSine_REVERSE(lastFinal / this.calendarWidth) * this.calendarWidth
                        final = easeInOutSine(x / this.calendarWidth) * this.calendarWidth;
                    } else if (currentStyle == null ) {
                        x = lastFinal;
                        final = lastFinal;
                    }
                }

                this.renderer.setStyle(
                    primary,
                    'transform',
                    `translateX(${
                        dir * -final
                    }px)`
                );
    
                this.renderer.setStyle(
                    secondary,
                    'transform',
                    `translateX(${
                        dir *
                        (-final + this.calendarWidth)
                    }px)`
                )
    
                if ((netDir == 1 && x < this.calendarWidth) || (netDir == -1 && x > 0)) {
                    window.requestAnimationFrame(translate);
                } else {
                    resolve(netDir == 1 ? true : false);
                }
            };
    
            window.requestAnimationFrame(translate);
        })
	}

    lastDir! : number | undefined;
    lastClickTime! : number | undefined;
    clickTime! : number | undefined;

	onArrow = (dir: number, isRecursion? : boolean, id : number = 0) => {
        if (this.lastDir != dir && this.lastDir != undefined && this.isTransitioning) {
            this.requestedReverse = true;
            this.lastDir = undefined;
            this.lastClickTime = undefined;

            this.queue = 0;
            this.updateMonday(dir);

            if (this.isOnCurrentWeek()) this.secondaryCalendar.highlightDate = true;
            else this.secondaryCalendar.highlightDate = false;
    
            const alreadyUpdatedWeek = this.update(); // returns true if the update resulted in a change of year so a change of week
            if (!alreadyUpdatedWeek) this.numWeeks += dir;
    
            this.position(this.secondaryCalendar, dir);
            this.lastDir = dir;
            return;
        }

        this.lastClickTime = this.clickTime;
        this.clickTime = Date.now();
        this.lastDir = dir;

        if (!isRecursion) {
            if (this.isTransitioning) {
                let s = this.currentCalendarSpeed;

                if (this.lastClickTime != undefined) {
                    s = 600 / (this.clickTime - this.lastClickTime);
                }

                this.currentCalendarSpeed = Math.min(s, 8);
                this.queue += 1;
                return;
            } else {
                this.isTransitioning = true;
                this.currentCalendarSpeed = 2;
                this.queue = 1;
            }
        }

		this.updateMonday(dir);

		if (this.isOnCurrentWeek()) this.secondaryCalendar.highlightDate = true;
		else this.secondaryCalendar.highlightDate = false;

		this.secondaryCalendar.update();
		const alreadyUpdatedWeek = this.update(); // returns true if the update resulted in a change of year so a change of week
        if (!alreadyUpdatedWeek) this.numWeeks += dir;

		this.position(this.secondaryCalendar, dir);
        this.secondaryCalendar.elementRef.nativeElement.style.display = 'grid';

		this.interpolate(this.activeCalendar, this.secondaryCalendar, dir, ++id).then((success : boolean) => {
            if (success) {
                this.swapCalendars();
                this.queue -= 1;
            }
            
            if (this.queue > 0) {
                this.onArrow(success ? dir : -dir, true, id)
            } else {
                this.lastDir = undefined;
                this.lastClickTime = undefined;
                this.isTransitioning = false;
            }
        });
	}

	isOnCurrentWeek(): boolean {
		return this.offsetFromThisWeek == 0;
	}

	updateMonday(dir: number) {
        if (this.OneDayInterval) {
            this.offsetFromLocalMonday += dir;
            this.offsetFromGlobalMonday += dir;

            const isOver7 : boolean = this.offsetFromLocalMonday >= 7;
            const isUnder0 : boolean = this.offsetFromLocalMonday < 0;

            if (isOver7 || isUnder0) {
                this.offsetFromThisWeek += dir;

                if (isOver7)
                    this.offsetFromLocalMonday = 0;
                else if (isUnder0)
                    this.offsetFromLocalMonday = 6;
            }
        } else {
            this.offsetFromThisWeek += dir;
        }

		this.weekMonday = new Date(
			this.date.weekMonday_Year,
			this.date.weekMonday_Month,
			this.date.weekMonday_Date + (this.offsetFromThisWeek * 7)
		);
	}

	setDateWeek = () => {
		const year = this.weekMonday.getFullYear();

		const januaryFirst = new Date(year, 0, 1);
		const daysToNextMonday =
			januaryFirst.getDay() === 1 ? 7 : (7 - januaryFirst.getDay()) % 7;
		const nextMonday: Date = new Date(
			year,
			0,
			januaryFirst.getDate() + daysToNextMonday
		);

		this.numWeeks =
        this.weekMonday < nextMonday
				? 52
				: this.weekMonday > nextMonday
				? Math.ceil(
						((this.weekMonday as any) - (nextMonday as any)) /
							(24 * 3600 * 1000) /
							7
				  )
				: 1;
	};

	update = (): boolean => {
		let changedWeeks = false;

		if (this.isOnCurrentWeek()) {
			this.selectedYear = this.date.currentYear;
			this.selectedMonth = this.date.currentMonth;
		} else {
			const year = this.weekMonday.getFullYear();

			if (year != this.selectedYear) {
				this.setDateWeek();
				changedWeeks = true;
			}

			this.selectedYear = year;
			this.selectedMonth = months[this.weekMonday.getMonth()];
		}

		return changedWeeks;
	};
}