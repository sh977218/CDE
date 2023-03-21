import { state, style, trigger } from '@angular/animations';

export const copySectionAnimation = trigger('copySection', [
    state('copied', style({ border: 'orange 1px solid' })),
    state('clear', style({})),
]);
