import { Component, Input, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModalModule, NgbModal, NgbModalRef, } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert/alert.service';
import { DataElement } from 'core/dataElement.model';
import { Property } from 'core/models.model';
import { OrgHelperService } from 'core/orgHelper.service';


@Component({
    selector: 'cde-properties',
    templateUrl: './properties.component.html'
})
export class PropertiesComponent implements OnInit {
    @Input() canEdit: boolean = false;
    @Input() elt: DataElement;
    @Output() onEltChange = new EventEmitter();
    @ViewChild('newPropertyContent') newPropertyContent: NgbModalModule;
    modalRef: NgbModalRef;
    newProperty: Property = new Property();
    onInitDone: boolean = false;
    orgPropertyKeys: string[] = [];

    ngOnInit() {
        this.orgHelperService.reload().then(() => {
            this.orgPropertyKeys = this.orgHelperService.orgsDetailedInfo[this.elt.stewardOrg.name].propertyKeys;
            this.onInitDone = true;
        });
    }

    constructor(
        private alert: AlertService,
        public modalService: NgbModal,
        private orgHelperService: OrgHelperService,
    ) {
    }

    addNewProperty() {
        this.elt.properties.push(this.newProperty);
        this.onEltChange.emit();
        this.modalRef.close();
    }

    openNewPropertyModal() {
        if (this.orgPropertyKeys.length === 0) {
            this.alert.addAlert('danger', 'No valid property keys present, have an Org Admin go to Org Management > List Management to add one');
        } else {
            this.modalRef = this.modalService.open(this.newPropertyContent, {size: 'lg'});
            this.modalRef.result.then(() => {
                this.newProperty = new Property();
            }, () => {
            });
        }
    }

    removePropertyByIndex(index) {
        this.elt.properties.splice(index, 1);
        this.onEltChange.emit();
    }

    reorderProperty() {
        this.onEltChange.emit();
    }

    setHtml(isHtml) {
        this.newProperty.valueFormat = isHtml ? 'html' : '';
    }
}
