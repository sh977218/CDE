import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Elt, User } from 'core/public/models.model';
import { DataElement } from 'cde/public/dataElement.model';

@Component({
    selector: 'cde-cde-accordion-list',
    templateUrl: './cdeAccordionList.component.html'
})
export class CdeAccordionListComponent {
    @Input() addMode: any = null;
    @Input() ejsPage: string = null;
    @Input() elts: DataElement[];
    @Input() openInNewTab: boolean = false;
    @Output() add = new EventEmitter<DataElement>();

    module = 'cde';
    pinModal: any;
    user: User;
    Elt = Elt;

    constructor(@Inject('userResource') private userService,
                @Inject('PinModal') public PinModal,
                @Inject('QuickBoard') public quickBoard) {
        this.pinModal = this.PinModal.new('cde');

        this.userService.getPromise().then(() => {
            this.user = this.userService.user;
        });
    }
}