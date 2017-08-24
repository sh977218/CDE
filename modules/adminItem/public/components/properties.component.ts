import { Component, Inject, Input, ViewChild, OnInit, Output, EventEmitter } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import { OrgHelperService } from "../../../core/public/orgHelper.service";
import { AlertService } from "../../../system/public/components/alert/alert.service";

import "rxjs/add/operator/map";

@Component({
    selector: "cde-properties",
    providers: [],
    templateUrl: "./properties.component.html"
})
export class PropertiesComponent implements OnInit {
    @ViewChild("newPropertyContent") public newPropertyContent: NgbModalModule;
    @Input() public elt: any;
    @Output() onEltChange = new EventEmitter();
    orgPropertyKeys: string[] = [];
    public newProperty: any = {};
    public modalRef: NgbModalRef;

    public onInitDone: boolean;

    constructor(private alert: AlertService,
                private http: Http,
                @Inject("isAllowedModel") public isAllowedModel,
                private orgHelperService: OrgHelperService,
                public modalService: NgbModal) {
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
            this.modalRef.result.then(() => this.newProperty = {}, () => {
            });
        }
    }

    addNewProperty() {
        this.elt.properties.push(this.newProperty);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Property added. Save to confirm.");
            this.modalRef.close();
        } else {
            this.onEltChange.emit({type: "success", message: "Property added"});
            this.modalRef.close();
        }
    }

    removePropertyByIndex(index) {
        this.elt.properties.splice(index, 1);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Property removed. Save to confirm.");
        } else {
            this.onEltChange.emit({type: "success", message: "Property removed"});
            this.modalRef.close();
        }
    }

    saveProperty() {
        this.onEltChange.emit({type: "success", message: "Property saved."});
    };

    reorderProperty() {
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Property reordered. Save to confirm.");
        } else {
            this.onEltChange.emit({type: "success", message: "Property reordered."});
            this.modalRef.close();
        }
    }

}
