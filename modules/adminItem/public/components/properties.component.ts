import { Component, Input, ViewChild, OnInit, Output, EventEmitter } from "@angular/core";
import { NgbModalModule, NgbModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import "rxjs/add/operator/map";

import { Property } from 'core/public/models.model';
import { DataElement } from 'cde/public/dataElement.model';
import { AlertService } from 'system/public/components/alert/alert.service';
import { OrgHelperService } from 'core/public/orgHelper.service';

@Component({
    selector: "cde-properties",
    templateUrl: "./properties.component.html"
})
export class PropertiesComponent implements OnInit {
    @ViewChild("newPropertyContent") public newPropertyContent: NgbModalModule;
    @Input() public elt: DataElement;
    @Input() public canEdit: boolean = false;
    @Output() onEltChange = new EventEmitter();
    orgPropertyKeys: string[] = [];
    public newProperty: Property = new Property();
    public modalRef: NgbModalRef;
    public onInitDone: boolean = false;

    constructor(public modalService: NgbModal,
                private alert: AlertService,
                private orgHelperService: OrgHelperService) {
    }

    ngOnInit() {
        this.orgHelperService.then(() => {
            this.orgPropertyKeys = this.orgHelperService.orgsDetailedInfo[this.elt.stewardOrg.name].propertyKeys;
            this.onInitDone = true;
        });
    }

    openNewPropertyModal() {
        if (this.orgPropertyKeys.length === 0) {
            this.alert.addAlert("danger", "No valid property keys present, have an Org Admin go to Org Management > List Management to add one");
        } else {
            this.modalRef = this.modalService.open(this.newPropertyContent, {size: "lg"});
            this.modalRef.result.then(() => {
                this.newProperty = new Property();
            }, () => {
            });
        }
    }

    addNewProperty() {
        this.elt.properties.push(this.newProperty);
        this.onEltChange.emit();
        this.modalRef.close();
    }

    removePropertyByIndex(index) {
        this.elt.properties.splice(index, 1);
        this.onEltChange.emit();
    }

    reorderProperty() {
        this.onEltChange.emit();
    }

}
