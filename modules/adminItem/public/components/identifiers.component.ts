import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbModalModule, NgbModalRef, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'cde-identifiers',
    providers: [NgbActiveModal],
    templateUrl: './identifiers.component.html'
})
export class IdentifiersComponent {
    @Input() canEdit: boolean = false;
    @Input() elt: any;
    @Output() onEltChange = new EventEmitter();
    @ViewChild('newIdentifierContent') newIdentifierContent: NgbModalModule;
    modalRef: NgbModalRef;
    newIdentifier: any = {};

    constructor(
        public modalService: NgbModal,
    ) {
    }

    addNewIdentifier() {
        this.elt.ids.push(this.newIdentifier);
        this.onEltChange.emit();
        this.modalRef.close();
    }

    openNewIdentifierModal() {
        this.modalRef = this.modalService.open(this.newIdentifierContent, {size: 'lg'});
        this.modalRef.result.then(() => this.newIdentifier = {}, () => {
        });
    }

    removeIdentifierByIndex(index) {
        this.elt.ids.splice(index, 1);
        this.onEltChange.emit();
    }
}
