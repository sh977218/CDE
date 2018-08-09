import { Component, Input } from '@angular/core';

import { Elt } from 'shared/models.model';
import { interruptEvent } from 'widget/browser';

@Component({
    selector: 'cde-pin-board',
    template: `
        <i id="pinToBoard_{{eltIndex}}" class="fa fa-thumb-tack hand-cursor" title="Attach to Board" role="link"
           (click)="interruptEvent($event);mltPinModal.pinMultiple([elt], mltPinModal.open())" tabindex="0"> </i>
        <cde-pin-board-modal #mltPinModal [module]="module"></cde-pin-board-modal>
    `
})
export class PinBoardComponent {
    @Input() elt: Elt;
    @Input() eltIndex: number;
    @Input() module: any;
    interruptEvent = interruptEvent;
}
