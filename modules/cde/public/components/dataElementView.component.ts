import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import { AlertService } from "../../../system/public/components/alert/alert.service";
import { DataElementService } from "../dataElement.service";

@Component({
    selector: "cde-data-element-view",
    templateUrl: "dataElementView.component.html"
})
export class DataElementViewComponent implements OnInit {
    @ViewChild("copyDataElementContent") public copyDataElementContent: NgbModalModule;
    @Input() elt: any;
    public eltCopy = {};
    public modalRef: NgbModalRef;


    eltLoaded: boolean = false;

    constructor(public modalService: NgbModal,
                @Inject("isAllowedModel") public isAllowedModel,
                private dataElementService: DataElementService,
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
        this.dataElementService.get(tinyId).subscribe(res => {
            this.elt = res;
            this.eltLoaded = true;
        }, err => this.alert.addAlert("danger", "Sorry, we are unable to retrieve this element."));
    }

    openCopyElementModal() {
        this.eltCopy = _.cloneDeep(this.elt);
        delete this.eltCopy["_id"];
        delete this.eltCopy["tinyId"];
        this.eltCopy["naming"][0].designation = "Copy of " + this.eltCopy["naming"][0].designation;
        this.modalRef = this.modalService.open(this.copyDataElementContent, {size: "lg"});
    }

    reload(elt = null) {
        if (elt) this.elt = elt;
    }
}