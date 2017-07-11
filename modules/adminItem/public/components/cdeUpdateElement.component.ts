import { Component, Input, Output, ViewChild, EventEmitter } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../system/public/components/alert/alert.service";
import * as _  from "lodash";

const urlMap = {
    cde: {
        save: "/debytinyid/",
        exist: "/deLatestVersionByTinyId/"
    },
    form: {
        get: "",
        exist: ""
    }
};

@Component({
    selector: "cde-update-element",
    templateUrl: "./cdeUpdateElement.component.html"
})
export class CdeUpdateElementComponent {
    @ViewChild("updateElementContent") public updateElementContent: NgbModalModule;
    @Input() elt: any;
    public modalRef: NgbModalRef;
    public duplicatedVersion = false;
    public overrideVersion: false;
    @Output() discard = new EventEmitter();

    constructor(public modalService: NgbModal, public http: Http, private alert: AlertService) {
    }

    openSaveModal() {
        this.newVersionVersionUnicity();
        this.modalRef = this.modalService.open(this.updateElementContent, {size: "lg"});
    }

    discardChange() {
        let url = urlMap[this.elt.elementType].save + this.elt.tinyId + "/" + this.elt.version;
        this.http.post(url, this.elt).map(res => res.json()).subscribe(res => {
            this.discard.emit(res);
        }, err => {
            this.alert.addAlert("danger", err);
        })
    }

    newVersionVersionUnicity(newVersion = null) {
        if (newVersion === null) newVersion = this.elt.version;
        let url = urlMap[this.elt.elementType].exist + this.elt.tinyId;
        if (!url) return this.alert.addAlert("danger", "Unknown element type " + this.elt.elementType);
        this.http.get(url).map(res => res.json()).subscribe(
            res => {
                if (_.isEqual(res.toString(), newVersion.toString())) {
                    this.duplicatedVersion = true;
                } else {
                    this.duplicatedVersion = false;
                    this.overrideVersion = false;
                }
            }, err => this.alert.addAlert("danger", err));
    }

}