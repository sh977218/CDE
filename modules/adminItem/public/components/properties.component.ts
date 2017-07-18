import { Component, Inject, Input, ViewChild, OnInit } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import { OrgHelperService } from "../../../core/public/orgHelper.service";
import { AlertService } from "../../../system/public/components/alert/alert.service";

import "rxjs/add/operator/map";

@Component({
    selector: "cde-admin-item-properties",
    providers: [],
    templateUrl: "./properties.component.html"
})
export class PropertiesComponent implements OnInit {
    @ViewChild("newPropertyContent") public newPropertyContent: NgbModalModule;
    @Input() public elt: any;
    orgPropertyKeys: string[] = [];
    public newProperty: any = {};
    public modalRef: NgbModalRef;

    public onInitDone: boolean;

    constructor(private alert: AlertService,
                private http: Http,
                @Inject("isAllowedModel") public isAllowedModel,
                public orgHelpers: OrgHelperService,
                public modalService: NgbModal) {
    }

    ngOnInit() {
        this.orgHelpers.orgDetails.subscribe(() => {
            this.orgPropertyKeys = this.orgHelpers.orgsDetailedInfo[this.elt.stewardOrg.name].propertyKeys;
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
        } else if (this.elt.elementType === "cde") {
            this.http.put("/dataElement/tinyId/" + this.elt.tinyId, this.elt).map(res => res.json()).subscribe(res => {
                if (res) {
                    this.elt = res;
                    this.alert.addAlert("success", "Property Added");
                    this.modalRef.close();
                }
            }, err => this.alert.addAlert("danger", err));
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.alert.addAlert("success", "Property Added");
                this.modalRef.close();
            });
        }
    }

    removePropertyByIndex(index) {
        this.elt.properties.splice(index, 1);
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Property removed. Save to confirm.");
        } else if (this.elt.elementType === "cde") {
            this.http.put("/dataElement/tinyId/" + this.elt.tinyId, this.elt).map(res => res.json()).subscribe(res => {
                if (res) {
                    this.elt = res;
                    this.alert.addAlert("success", "Property Removed");
                }
            }, err => this.alert.addAlert("danger", err));
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.alert.addAlert("success", "Property Removed.");
            });
        }
    }

    saveProperty() {
        this.elt.$save(newElt => {
            this.elt = newElt;
            this.alert.addAlert("success", "Property Saved.");
        });
    };

    reorderProperty() {
        if (this.elt.unsaved) {
            this.alert.addAlert("info", "Property reordered. Save to confirm.");
        } else if (this.elt.elementType === "cde") {
            this.http.put("/dataElement/tinyId/" + this.elt.tinyId, this.elt).map(res => res.json()).subscribe(res => {
                if (res) {
                    this.elt = res;
                    this.alert.addAlert("success", "Property Reordered.");
                }
            }, err => this.alert.addAlert("danger", err));
        } else {
            this.elt.$save(newElt => {
                this.elt = newElt;
                this.alert.addAlert("success", "Property Reordered");
            });
        }
    }

}
