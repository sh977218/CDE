import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Elt } from 'shared/models.model';
import { interruptEvent, openUrl } from 'non-core/browser';

@Component({
    templateUrl: './accordionListHeading.component.html'
})
export class AccordionListHeadingComponent {
    @Input() addMode: any;
    @Input() elt: Elt;
    @Input() eltIndex: number;
    @Input() openInNewTab: boolean;
    @Output() add = new EventEmitter<Elt>();
    Elt = Elt;

    clickAdd(event) {
        interruptEvent(event);
        this.add.emit(this.elt);
    }

    clickView(event) {
        openUrl(Elt.getEltUrl(this.elt), event);
        interruptEvent(event);
    }
}
