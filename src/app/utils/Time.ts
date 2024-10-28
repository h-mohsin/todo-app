export class Time {
	static StringToTime(s: string, militaryTime?: boolean): string[] | number {
		let [t, timeOfDay] = s.split(' ');
        let [hours, minutes] = t.split(':');
         
		let hrs = Number.parseInt(hours);
        let mins : number | null = null;

        if (minutes) {
            mins = Number.parseInt(minutes) / 60;
        }

		if (militaryTime) {
			if (hrs < 12 && timeOfDay.toLowerCase() == 'pm') hrs += 12;

			if (hrs == 12 && timeOfDay.toLowerCase() == 'am') hrs -= 12;

			return hrs;
		}

		return [hours, timeOfDay, minutes];
	}

	static TimeToString(numericHours: number): string {
		if (numericHours == 12) {
			return '12 PM';
		} else if (numericHours == 24 || numericHours == 0) {
			return '12 AM';
		}

		let timeOfDay = null;

		if (numericHours > 12) {
			timeOfDay = 'PM';
		} else {
			timeOfDay = 'AM';
		}

		return (numericHours % 12).toString() + ' ' + timeOfDay;
	}
}
