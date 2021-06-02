import { Component, Input } from '@angular/core';

import { Elt } from 'shared/models.model';
import { interruptEvent } from 'non-core/browser';

@Component({
    selector: 'cde-pin-board',
    template: `
        <mat-icon id="pinToBoard_{{eltIndex}}" class="hand-cursor" title="Attach to Board" role="link"
           (click)="interruptEvent($event);mltPinModal.pinMultiple([elt])" svgIcon="thumb_tack"></mat-icon>
        <cde-pin-board-modal #mltPinModal [module]="module"></cde-pin-board-modal>
    `
})
export class PinBoardComponent {
    @Input() elt!: Elt;
    @Input() eltIndex!: number;
    @Input() module: any;
    interruptEvent = interruptEvent;
}
