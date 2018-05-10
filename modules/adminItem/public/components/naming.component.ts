import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from '@angular/core';
import { NgbModalModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { Naming } from 'shared/models.model';
import { OrgHelperService } from 'core/orgHelper.service';

@Component({
    selector: 'cde-naming',
    templateUrl: './naming.component.html'
})
export class NamingComponent implements OnInit {
    @Input() canEdit: boolean = false;
    @Input() elt: any;
    @Output() onEltChange = new EventEmitter();
    @ViewChild('newNamingContent') newNamingContent: NgbModalModule;
    modalRef: NgbModalRef;
    newNaming: Naming = new Naming();
    tags = [];

    constructor(public modalService: NgbModal,
                private orgHelperService: OrgHelperService) {
    }

    ngOnInit() {
        let stewardOrgName = this.elt.stewardOrg.name;
        let namingTags = this.orgHelperService.orgsDetailedInfo[stewardOrgName].nameTags;
        this.tags = this.elt.naming.reduce((accumulator, currentValue) => {
            return accumulator.concat(currentValue.tags);
        }, namingTags);
    }

    addNewNaming() {
        this.elt.naming.push(this.newNaming);
        this.modalRef.close();
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
