import { Component, Input, Output, OnInit, ViewChild, EventEmitter } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";
import { AlertService } from "../../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-save-modal",
    templateUrl: "./saveModal.component.html"
})
export class SaveModalComponent implements OnInit {

    @ViewChild("updateElementContent") public updateElementContent: NgbModalModule;

    @Input() elt: any;
    @Output() save = new EventEmitter();

    public modalRef: NgbModalRef;
    public duplicatedVersion = false;
    public overrideVersion: false;

    constructor(public modalService: NgbModal,
                public http: Http,
                private alert: AlertService) {
    }

    ngOnInit(): void {
        if (this.elt) this.elt.changeNote = "";
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
        this.newVersionVersionUnicity();
        if (this.elt) this.elt.changeNote = "";
        this.modalRef = this.modalService.open(this.updateElementContent, {container: "body", size: "lg"});
    }

}