import { Component, Input } from '@angular/core';

import { Elt } from 'shared/models.model';
import { interruptEvent } from 'non-core/browser';

@Component({
    selector: 'cde-pin-board',
    template: `
        <a id="pinToBoard_{{eltIndex}}" title="Attach to Board" class="fake-button" role="button" tabindex="0"
           (click)="interruptEvent($event);mltPinModal.pinMultiple([elt])">
            <mat-icon svgIcon="thumb_tack"></mat-icon>
        </a>
        <cde-pin-board-modal #mltPinModal [module]="module"></cde-pin-board-modal>
    `
})
export class PinToBoardComponent {
    @Input() elt!: Elt;
    @Input() eltIndex!: number;
    @Input() module: any;
    interruptEvent = interruptEvent;
}
