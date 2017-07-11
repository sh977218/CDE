import { Component, Input, ViewChild, OnInit } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../system/public/components/alert/alert.service";
import * as _  from "lodash";

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

    constructor(public modalService: NgbModal, public http: Http, private alert: AlertService) {
    }

    openSaveModal() {
        this.newVersionVersionUnicity();
        this.modalRef = this.modalService.open(this.updateElementContent, {size: "lg"});
    }

    discardChange() {
        this.http.get("/deviewByTinyId")
    }

    newVersionVersionUnicity(newVersion = null) {
        let url;
        if (this.elt.elementType === "form")
            url = '/formExists/' + this.elt.tinyId + "/" + newVersion;
        else if (this.elt.elementType === "cde")
            url = '/deLatestVersionByTinyId/' + this.elt.tinyId;
        else this.alert.addAlert("danger", "Unknown element type " + this.elt.elementType);
        this.http.get(url).map(res => res.json()).subscribe(
            res => {
                if (_.isEqual(res.toString(), this.elt.version.toString())) {
                    this.duplicatedVersion = true;
                } else {
                    this.duplicatedVersion = false;
                    this.overrideVersion = false;
                }
            }, err => this.alert.addAlert("danger", err));
    }

}