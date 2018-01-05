import { Component, Input, Output, ViewChild, EventEmitter } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import * as formShared from '../../../../form/shared/formShared';
import { AlertService } from '_app/alert/alert.service';

@Component({
    selector: "cde-save-modal",
    templateUrl: "./saveModal.component.html"
})
export class SaveModalComponent {
    protected newCdes = [];

    @ViewChild("updateElementContent") public updateElementContent: NgbModalModule;

    @Input() elt: any;
    @Output() save = new EventEmitter();
    @Output() onEltChange = new EventEmitter();

    public modalRef: NgbModalRef;
    public duplicatedVersion = false;
    public overrideVersion: false;

    constructor(public modalService: NgbModal,
                public http: Http,
                private alert: AlertService) {
    }

    confirmSave() {
        this.modalRef.close();
        this.save.emit();
    }

    newVersionVersionUnicity(newVersion = null) {
        if (newVersion === null) newVersion = this.elt.version;
        let url;
        if (this.elt.elementType === "cde")
            url = "/de/" + this.elt.tinyId + "/latestVersion/";
        if (this.elt.elementType === "form")
            url = "/form/" + this.elt.tinyId + "/latestVersion/";
        this.http.get(url).map(res => res.text()).subscribe(
            res => {
                if (res && newVersion && _.isEqual(res.toString(), newVersion.toString())) {
                    this.duplicatedVersion = true;
                } else {
                    this.duplicatedVersion = false;
                    this.overrideVersion = false;
                }
            }, err => this.alert.addAlert("danger", err));
    }

    openSaveModal() {
        this.newCdes = [];
        this.newVersionVersionUnicity();
        if (this.elt) this.elt.changeNote = "";
        if (this.elt.elementType === 'form' && this.elt.isDraft) {
            formShared.iterateFes(this.elt, () => {
                this.modalRef = this.modalService.open(this.updateElementContent, {container: "body", size: "lg"});
            }, null, null, (fe, cb) => {
                if (!fe.question.cde.tinyId) {
                    if (fe.question.cde.naming.length === 0) {
                        fe.question.cde.naming.invalid = true;
                        fe.question.cde.naming.message = "no naming.";
                    } else {
                        fe.question.cde.naming.invalid = false;
                        fe.question.cde.naming.message = null;
                    }
                    this.newCdes.push(fe.question.cde);
                }
                if (cb) cb();
            });
        } else this.modalRef = this.modalService.open(this.updateElementContent, {container: "body", size: "lg"});
    }
}