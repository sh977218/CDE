import { trigger, state, animate, transition, style } from '@angular/animations';

export const copySectionAnimation =
    trigger('copySection', [

        transition(':enter', [

            style({opacity: 0}),

            animate('.3s', style({opacity: 1}))
        ]),
    ]);