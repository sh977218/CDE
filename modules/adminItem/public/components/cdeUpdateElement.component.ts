import { Component, Input, Output, OnInit, ViewChild, EventEmitter } from "@angular/core";
import { NgForm, NgControl } from "@angular/forms";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from "../../../system/public/components/alert/alert.service";
import * as _ from "lodash";

@Component({
    selector: "cde-update-element",
    templateUrl: "./cdeUpdateElement.component.html"
})
export class CdeUpdateElementComponent implements OnInit {
    @ViewChild("updateElementContent") public updateElementContent: NgbModalModule;
    @Input() elt: any;
    public modalRef: NgbModalRef;
    public duplicatedVersion = false;
    public overrideVersion: false;
    @Output() discard = new EventEmitter();
    @Output() save = new EventEmitter();

    constructor(public modalService: NgbModal, public http: Http, private alert: AlertService) {
    }

    ngOnInit(): void {
        this.elt.changeNote = "";
    }

    openSaveModal() {
        this.newVersionVersionUnicity();
        this.modalRef = this.modalService.open(this.updateElementContent, {container: "body", size: "lg"});
    }

    discardChange() {
        this.discard.emit();
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

}