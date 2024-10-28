import {
	trigger,
	state,
	style,
	animate,
	transition,
} from '@angular/animations';
import { TodoItem } from '../todo/Task/TodoItem.component';

export const expandContract = trigger('expandContract', [
    state('expand', style({ height: `{{height}}px` }), { params : {height : TodoItem.taskHeight * 7 / 4}}),
    state('contract', style({ height: `*` }), { params : {height : TodoItem.taskHeight}}),
    transition('expand <=> contract', animate('0.25s ease'))
])

export const expandContract_1 = trigger('expandContract_1', [
    state('expand', style({ height: `${TodoItem.taskHeight * 0.75}px` })),
    state('contract', style({ height: `0px` })),
    transition('expand <=> contract', animate('0.25s ease')),
])
