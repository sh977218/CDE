import { Component, Input, Output, ViewChild, EventEmitter } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../system/public/components/alert/alert.service";
import * as _ from "lodash";

const urlMap = {
    cde: {
        save: "/dataElement/",
        exist: "/dataElement/tinyId/"
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

    newVersionVersionUnicity(event = null) {
        if (!event) return;
        let newVersion = "";
        if (!event) newVersion = this.elt.version;
        console.log("event: " + event);
        let url = urlMap[this.elt.elementType].exist + this.elt.tinyId + "/version/";
        if (!url) return this.alert.addAlert("danger", "Unknown element type " + this.elt.elementType);
        this.http.get(url).map(res => res.text()).subscribe(
            res => {
                if (res && newVersion) {
                    if (_.isEqual(res.toString(), newVersion.toString())) {
                        this.duplicatedVersion = true;
                    } else {
                        this.duplicatedVersion = false;
                        this.overrideVersion = false;
                    }
                } else {
                    this.duplicatedVersion = false;
                    this.overrideVersion = false;
                }
            }, err =>
                this.alert.addAlert("danger", err));
    }

}