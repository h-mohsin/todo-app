import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const testing = require('./schedule/TestData.json');

@Injectable({providedIn: 'root'})
export class TaskService {
    public tasks : {[key : string] : {[key : string] : string[][]}} = testing;
	private updateData = new BehaviorSubject<any>(this.tasks);

	addNewTask(newTask : string[]) {
        const [date, task, startTime, endTime] : string[] = newTask;
        (this.tasks[date][startTime]).push([task, endTime]);

        this.updateData.next(this.tasks);
	}

    getTasks() {
        return this.updateData;
    }
}
