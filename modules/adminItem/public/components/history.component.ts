import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { Http } from '@angular/http';

import "rxjs/add/operator/map";
import { CompareSideBySideComponent } from "../../../compare/compareSideBySide.component";

@Component({
    selector: "cde-admin-item-history",
    templateUrl: "./history.component.html",
    styles: [`
        caption {
            caption-side: top;
        }`]
})
export class HistoryComponent implements OnInit {
    @ViewChild("compareSideBySideComponent") public compareSideBySideComponent: CompareSideBySideComponent;
    @Input() public elt: any;
    showVersioned: boolean = false;
    public priorCdes = [];
    public numberSelected: number = 0;
    public compareOptions = {
/*
        "version": {},
        "_id": {},
        "tinyId": {},
        "views": {},
        "stewardOrg": {"name": {}},
        "registrationState": {"registrationStatus": {}},
*/
        "valueDomain": {
            "datatype": {},
            "name": {},
            "datatypeDate": {
                "format": {}
            },
            "datatypeText": {
                "minLength": {},
                "maxLength": {},
                "regex": {},
                "rule": {}
            }
        }
/*
        "naming": {
            array: true,
            properties: {
                "designation": {},
                "definition": {}
            }
        }
*/
    };

    constructor(@Inject("Alert") private alert,
                private http: Http,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    ngOnInit(): void {
        if (this.elt.history && this.elt.history.length > 0) {
            this.http.get('/priorcdes/' + this.elt._id).map(res => res.json())
                .subscribe(res => {
                    this.priorCdes = res.reverse();
                    this.elt.viewing = true;
                    this.priorCdes.splice(0, 0, this.elt);
                }, err => this.alert.addAlert("danger", "Error retrieving history: " + err));
        }

    }

    selectRow(priorCde) {
        if (this.numberSelected === 2 && !priorCde.selected) {
            priorCde.selected = false;
        } else if (this.numberSelected === 2 && priorCde.selected) {
            priorCde.selected = false;
            this.numberSelected--;
        } else {
            priorCde.selected = !priorCde.selected;
            if (priorCde.selected) this.numberSelected++;
            else this.numberSelected--;
        }
    }

    openCompareSideBySideModal() {
        this.compareSideBySideComponent.openModal();
    }

    getSelectedElt() {
        let temp = this.priorCdes.filter(p => p.selected);
        return temp;
    }

}
