import { animate, state, style, transition, trigger } from '@angular/animations';

export const copySectionAnimation =
    trigger('copySection', [
        state('copy', style({
            backgroundColor: 'red',
            transform: 'scale(1)'
        })),
        state('unCopy', style({
            backgroundColor: 'blue',
            transform: 'scale(1.1)'
        })),
        transition('copy => unCopy', animate('100ms ease-in')),
        transition('unCopy => copy', animate('100ms ease-out'))
    ]);
