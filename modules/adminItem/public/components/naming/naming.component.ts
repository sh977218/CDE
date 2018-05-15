import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import _uniq from 'lodash/uniq';

import { OrgHelperService } from 'core/orgHelper.service';
import { DesignationComponent } from 'adminItem/public/components/naming/designation/designation.component';
import { DefinitionComponent } from 'adminItem/public/components/naming/definition/definition.component';

@Component({
    selector: 'cde-naming',
    templateUrl: './naming.component.html'
})
export class NamingComponent implements OnInit {
    @Input() canEdit: boolean = false;
    @Input() elt: any;
    @Output() onEltChange = new EventEmitter();
    tags = [];

    constructor(public modalService: NgbModal,
                private orgHelperService: OrgHelperService) {
    }

    ngOnInit() {
        let stewardOrgName = this.elt.stewardOrg.name;
        let namingTags = this.orgHelperService.orgsDetailedInfo[stewardOrgName].nameTags;
        let allNamingTags = this.elt.naming.reduce((accumulator, currentValue) => {
            return accumulator.concat(currentValue.tags);
        }, namingTags);
        this.tags = _uniq(allNamingTags);
    }

    removeDesignationByIndex(index) {
        this.elt.designations.splice(index, 1);
        this.onEltChange.emit();
    }

    removeDefinitionByIndex(index) {
        this.elt.definitions.splice(index, 1);
        this.onEltChange.emit();
    }

    openNewDesignationModal() {
        const modalRef = this.modalService.open(DesignationComponent, {size: 'lg'});
        modalRef.componentInstance.tags = this.tags;
        modalRef.componentInstance.onSave.subscribe(newDesignation => {
            this.elt.designations.push(newDesignation);
            modalRef.close();
            this.onEltChange.emit();
        });
    }

    openNewDefinitionModal() {
        const modalRef = this.modalService.open(DefinitionComponent, {size: 'lg'});
        modalRef.componentInstance.tags = this.tags;
        modalRef.componentInstance.onSave.subscribe(newDefinition => {
            this.elt.definitions.push(newDefinition);
            modalRef.close();
            this.onEltChange.emit();
        });
    }
}
