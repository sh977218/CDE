import { Component, Input, ViewChild, OnInit, Output, EventEmitter } from "@angular/core";
import { NgbModalModule, NgbModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import "rxjs/add/operator/map";
import * as _ from 'lodash';

import { Property } from 'core/models.model';
import { DataElement } from 'core/dataElement.model';
import { OrgHelperService } from 'core/orgHelper.service';
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: "cde-properties",
    templateUrl: "./properties.component.html"
})
export class PropertiesComponent implements OnInit {
    @ViewChild("newPropertyContent") public newPropertyContent: NgbModalModule;
    @Input() public elt: DataElement;
    @Input() public canEdit: boolean = false;
    @Output() onEltChange = new EventEmitter();
    orgPropertyKeys = [];
    public newProperty;
    public modalRef: NgbModalRef;
    public onInitDone: boolean = false;

    constructor(public modalService: NgbModal,
                private alert: AlertService,
                private orgHelperService: OrgHelperService) {
    }

    ngOnInit() {
        this.orgHelperService.then(() => {
            let eltKeys = this.elt.properties.filter(k => k.key).map(p => p.key);
            let orgKeys = this.orgHelperService.orgsDetailedInfo[this.elt.stewardOrg.name].propertyKeys;
            this.orgPropertyKeys = _.uniq(orgKeys.concat(eltKeys));
            this.onInitDone = true;
        });
    }

    addNewProperty() {
        if (this.orgPropertyKeys.length === 0) {
            this.alert.addAlert("danger", "No valid property keys present, have an Org Admin go to Org Management > List Management to add one");
        } else this.newProperty = new Property();
    }

    editNewPropertyKey(event) {
        this.newProperty.key = event;
        this.onEltChange.emit();
    }


    editNewPropertyValue() {
        if (this.newProperty && this.newProperty.value) {
            this.elt.properties.push(this.newProperty);
            this.onEltChange.emit();
            this.newProperty = null;
        } else this.alert.addAlert("danger", "Key and Value can not be empty.");
    }


    removePropertyByIndex(index) {
        this.elt.properties.splice(index, 1);
        this.onEltChange.emit();
    }

    reorderProperty() {
        this.onEltChange.emit();
    }

}
