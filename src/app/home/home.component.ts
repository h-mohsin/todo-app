import { Component } from "@angular/core";
import { TodosManager } from "./todo/TodosManager.component";
import { ScheduleContainer } from "./schedule/Schedule.component";

@Component({
    selector: 'home-page',
    styles: [`:host {
        position: absolute;
        height: 100%;
        width: 100%;
    }`],
    template: `
        <div class="grid grid-flow-col grid-cols-[24rem] max-lg:grid-cols-[0%] h-full w-full">
            <todo-manager class="h-full w-full max-lg:invisible"/>
            <schedule-container class="w-full h-full bg-white overflow-hidden"/>
        </div>
    `,
    imports: [TodosManager, ScheduleContainer],
    standalone: true
})
export class Home {}