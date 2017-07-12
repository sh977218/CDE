import { Component, Input, Output, ViewChild, EventEmitter } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../system/public/components/alert/alert.service";
import * as _  from "lodash";

const urlMap = {
    cde: {
        save: "/deByTinyId/",
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
    @Output() save = new EventEmitter();

    constructor(public modalService: NgbModal, public http: Http, private alert: AlertService) {
    }

    openSaveModal() {
        this.newVersionVersionUnicity();
        this.modalRef = this.modalService.open(this.updateElementContent, {size: "lg"});
    }

    discardChange() {
        this.discard.emit();
    }

    confirmSave() {
        this.save.emit();
        this.modalRef.close();
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