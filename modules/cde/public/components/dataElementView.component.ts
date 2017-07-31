import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";

import { AlertService } from "../../../system/public/components/alert/alert.service";
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';
import { CdeForm } from 'form/public/form.model';

@Component({
    selector: "cde-data-element-view",
    templateUrl: "dataElementView.component.html"
})
export class DataElementViewComponent {
    @ViewChild("copyDataElementContent") public copyDataElementContent: NgbModalModule;
    @ViewChild("commentAreaComponent") public commentAreaComponent: DiscussAreaComponent;
    @Input() elt: any;
    @Output() public stageElt = new EventEmitter();
    @Output() public reload = new EventEmitter();

    public eltCopy = {};
    public modalRef: NgbModalRef;
    commentMode;
    eltLoaded: boolean = false;
    currentTab = "general_tab";
    highlightedTabs = [];

    constructor(public modalService: NgbModal,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("QuickBoard") public quickBoard,
                @Inject("PinModal") public PinModal,
                private alert: AlertService) {
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
        this.modalRef = this.modalService.open(this.copyDataElementContent, {size: "lg"});
    }

    closeCopyElementModal() {
        this.modalRef.close();
    }

    loadHighlightedTabs($event) {
        this.highlightedTabs = $event;
    }

    beforeChange(event) {
        this.currentTab = event.nextId;
        if (this.commentMode)
            this.commentAreaComponent.setCurrentTab(this.currentTab);
    }
}