import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import { AlertService } from "../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-form-view",
    templateUrl: "formView.component.html"
})
export class FormViewComponent implements OnInit {
    @ViewChild("copyFormContent") public copyFormContent: NgbModalModule;
    @Input() elt: any;
    public eltCopy = {};
    public modalRef: NgbModalRef;
    commentMode;
    eltLoaded: boolean = false;
    currentTab = "general";

    constructor(private http: Http,
                public modalService: NgbModal,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("FormQuickBoard") public quickBoard,
                @Inject("PinModal") public PinModal,
                private alert: AlertService) {
    }

    // remove it once has angular2 route
    getParameterByName(name, url = null) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    ngOnInit(): void {
        let tinyId = this.getParameterByName("tinyId");
        let cdeId = this.getParameterByName("cdeId");
        let url;
        if (tinyId) {
            url = "/form/tinyId/" + tinyId;
        }
        if (cdeId) {
            url = "/form/id/" + cdeId;
        }
        this.http.get(url).map(res => res.json()).subscribe(res => {
            if (res) {
                this.elt = res;
                this.eltLoaded = true;
            } else
                this.alert.addAlert("danger", "Sorry, we are unable to retrieve this data element.");
        }, err =>
            this.alert.addAlert("danger", "Sorry, we are unable to retrieve this form." + err));
    }

    openCopyElementModal() {
        this.eltCopy = _.cloneDeep(this.elt);
        delete this.eltCopy["_id"];
        delete this.eltCopy["tinyId"];
        this.eltCopy["naming"][0].designation = "Copy of: " + this.eltCopy["naming"][0].designation;
        this.eltCopy["registrationState"] = {
            registrationStatus: "Incomplete",
            administrativeNote: "Copy of: " + this.elt.tinyId
        };
        this.modalRef = this.modalService.open(this.copyFormContent, {size: "lg"});
    }

    closeCopyFormModal() {
        this.modalRef.close();
    }

    reload() {
        this.http.get("/form/tinyId/" + this.elt.tinyId).map(res => res.json()).subscribe(res => {
            if (res) {
                this.elt = res;
                this.alert.addAlert("success", "Changes discarded.");
            } else this.alert.addAlert("danger", "Sorry, we are unable to retrieve this form.")
        }, err => this.alert.addAlert("danger", err));
    }

    saveForm() {
        this.http.put("/form/tinyId/" + this.elt.tinyId, this.elt).map(res => res.json()).subscribe(res => {
            if (res) {
                this.elt = res;
                this.alert.addAlert("success", "Form saved.");
            }
        }, err => this.alert.addAlert("danger", err));
    }

    beforeChange(event) {
        this.currentTab = event.nextId;
    }

    isIe() {
        let userAgent = window.navigator.userAgent;
        if (/internet explorer/i.test(userAgent)) return true;
        else return false;
    }

}