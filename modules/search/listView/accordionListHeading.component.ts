import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BrowserService } from 'widget/browser.service';
import { Elt } from 'core/models.model';

@Component({
    selector: 'cde-accordion-list-heading',
    templateUrl: './accordionListHeading.component.html'
})
export class AccordionListHeadingComponent {
    @Input() addMode: any;
    @Input() elt: Elt;
    @Input() eltIndex: number;
    @Input() openInNewTab: boolean;
    @Output() add = new EventEmitter<Elt>();

    BrowserService = BrowserService;

    clickAdd(event) {
        this.BrowserService.interruptEvent(event);
        this.add.emit(this.elt);
    }

    clickView(event) {
        this.BrowserService.openUrl(this.elt.getEltUrl(), event);
        this.BrowserService.interruptEvent(event);
    }

}