import { Component, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { NgbModalModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Naming } from 'shared/models.model';


@Component({
    selector: 'cde-naming',
    templateUrl: './naming.component.html'
})
export class NamingComponent {
    @Input() canEdit: boolean = false;
    @Input() elt: any;
    @Input() orgNamingTags: { id: string; text: string }[] = [];
    @Output() onEltChange = new EventEmitter();
    @ViewChild('newNamingContent') newNamingContent: NgbModalModule;
    modalRef: NgbModalRef;
    newNaming: Naming = new Naming();
    options = {
        multiple: true,
        tags: true,
        language: {
            noResults: () => {
                return 'No Tags found, Tags are managed in Org Management > List Management';
            }
        }
    };

    constructor(
        public modalService: NgbModal
    ) {
    }

    addNewNaming() {
        this.elt.naming.push(this.newNaming);
        this.modalRef.close();
        this.onEltChange.emit();
    }

    changedTags(name, data: { value: string[] }) {
        name.tags = data.value;
        this.onEltChange.emit();
    }

    openNewNamingModal() {
        this.modalRef = this.modalService.open(this.newNamingContent, {size: 'lg'});
        this.modalRef.result.then(() => {
            this.newNaming = new Naming();
        }, () => {
        });
    }

    removeNamingByIndex(index) {
        this.elt.naming.splice(index, 1);
        this.onEltChange.emit();
    }
}
