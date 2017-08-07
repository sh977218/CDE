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
export class DataElementViewComponent implements OnInit {
    @ViewChild("copyDataElementContent") public copyDataElementContent: NgbModalModule;
    @ViewChild("commentAreaComponent") public commentAreaComponent: DiscussAreaComponent;
    @Input() elt: any;
    @Output() public stageElt = new EventEmitter();
    @Output() public reload = new EventEmitter();

    public eltCopy = {};
    public modalRef: NgbModalRef;
    displayStatusWarning;
    hasComments;
    commentMode;
    eltLoaded: boolean = false;
    currentTab = "general_tab";
    highlightedTabs = [];

    constructor(private http: Http,
                public modalService: NgbModal,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("QuickBoard") public quickBoard,
                @Inject("PinModal") public PinModal,
                private alert: AlertService,
                @Inject("userResource") public userService) {
    }

    ngOnInit(): void {
        this.http.get("/comments/eltId/" + this.elt.tinyId)
            .map(res => res.json()).subscribe(
            res => this.hasComments = res && (res.length > 0),
            err => this.alert.addAlert("danger", "Error on loading comments. " + err)
        );
        this.isAllowedModel.setDisplayStatusWarning(this);
    }

    openCopyElementModal() {
        this.eltCopy = _.cloneDeep(this.elt);
        this.eltCopy["classification"] = this.elt.classification.filter(c => {
            return this.userService.userOrgs.indexOf(c.stewardOrg.name) !== -1;
        });
        this.eltCopy["registrationState.administrativeNote"] = "Copy of: " + this.elt.tinyId;
        delete this.eltCopy["tinyId"];
        delete this.eltCopy["_id"];
        delete this.eltCopy["origin"];
        delete this.eltCopy["created"];
        delete this.eltCopy["updated"];
        delete this.eltCopy["imported"];
        delete this.eltCopy["updatedBy"];
        delete this.eltCopy["createdBy"];
        delete this.eltCopy["version"];
        delete this.eltCopy["history"];
        delete this.eltCopy["changeNote"];
        delete this.eltCopy["comments"];
        delete this.eltCopy["forkOf"];
        delete this.eltCopy["views"];
        this.eltCopy["ids"] = [];
        this.eltCopy["sources"] = [];
        this.eltCopy["naming"][0].designation = "Copy of: " + this.eltCopy["naming"][0].designation;
        this.eltCopy["registrationState"] = {
            registrationStatus: "Incomplete",
            administrativeNote: "Copy of: " + this.elt.tinyId
        };
        this.modalRef = this.modalService.open(this.copyDataElementContent, {size: "lg"});
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
