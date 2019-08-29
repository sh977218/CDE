import { Component, EventEmitter, Input, Output } from '@angular/core';
import { interruptEvent, openUrl } from 'non-core/browser';
import { Elt } from 'shared/models.model';

@Component({
    templateUrl: './accordionListHeading.component.html'
})
export class AccordionListHeadingComponent {
    @Input() addMode: any;
    @Input() elt!: Elt;
    @Input() eltIndex!: number;
    @Input() openInNewTab!: boolean;
    @Output() add = new EventEmitter<Elt>();
    Elt = Elt;

    clickAdd(event: Event) {
        interruptEvent(event);
        this.add.emit(this.elt);
    }

    clickView(event: Event) {
        openUrl(Elt.getEltUrl(this.elt), event);
        interruptEvent(event);
    }
}
