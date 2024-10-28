import {
	trigger,
	state,
	style,
	animate,
	transition,
} from '@angular/animations';

export const opacityTranslateTransition = trigger('opacityTranslateTransition', [
    transition(':enter', [
        style({
            transform: 'translateY(-30px)',
            opacity: 0
        }),
        animate("300ms {{delay}}ms ease", style({ transform: 'translateY(0)', opacity: 1 })),
    ], {params: { delay: 0}}),
    transition(':leave', [
        style({
            transform: 'translateY(0)',
            opacity: 1
        }),
        animate(
            '200ms ease',
            style({ transform: 'translateY(-30px)', opacity: 0 })
        ),
    ]),
])

export const opacityTranslateTransition2 = trigger('opacityTranslateTransition2', [
    state('invisible',
        style({
            transform: 'translateY(-30px)',
            opacity: 0
        })),
    state('visible',
        style({
            transform: 'translateY(0)',
            opacity: 1
        })
    ),
    transition('start <=> end', animate("300ms {{delay}}ms ease"), {params: { delay: 0 }})
])

export const heightTransition = trigger('heightTransition', [
    transition(':enter', [
        style({
            height: 0,
        }),
        animate('{{t}}ms ease', style({ height: `*` }))
        
    ], {params: { t : 200 }}),

    transition(':leave', [
        style({
            height: '*'
        }),
        animate(
            '{{t}}ms ease',
            style({ height: 0 })
        ),
    ], {params: { t : 200 }}),
])

export const heightTransition2 = trigger('heightTransition2', [
    transition(':enter', [
        style({
            height: 0,
        })
    ]),

    transition(':leave', [
        style({
            height: '*'
        })
    ])
])

export const heightLeaveTransition = trigger('heightLeaveTransition', [
    transition(':leave', [
        style({
            height: '*'
        }),
        animate(
            '200ms ease',
            style({ height: 0 })
        ),
    ]),
])
