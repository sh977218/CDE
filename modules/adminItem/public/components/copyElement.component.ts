import { Component, Inject, Input, Output, OnInit, ViewChild, EventEmitter } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import * as _ from "lodash";
import { DataElementService } from "../../../cde/public/dataElement.service";

@Component({
    selector: "cde-copy-element",
    templateUrl: "copyElement.component.html"
})
export class CopyElementComponent {
    @ViewChild("classifyItemContent") public classifyItemContent: NgbModalModule;
    @Input() elt: any;
    @Output() updateElt = new EventEmitter();
    public modalRef: NgbModalRef;
    originName;

    info: string = "You are about to create a new CDE/Form by duplicating this one. Please specify a new name and a classification of the CDE/Form.";

    constructor(@Inject("isAllowedModel") public isAllowedModel,
                private dataElementService: DataElementService) {
    }


    saveCopy() {
        this.dataElementService.save(this.elt);
    }

    isNameNew() {
        return this.originName !== this.elt.naming[0].designation;
    };


    a() {
        elt.classification = elt.classification.filter(function (c) {
            return userResource.userOrgs.indexOf(c.stewardOrg.name) !== -1;
        });
        elt.registrationState.administrativeNote = "Copy of: " + elt.tinyId;
        delete elt.tinyId;
        delete elt._id;
        delete elt.source;
        elt.sources = [];
        delete elt.origin;
        delete elt.created;
        delete elt.updated;
        delete elt.imported;
        delete elt.updatedBy;
        delete elt.createdBy;
        delete elt.version;
        delete elt.history;
        delete elt.changeNote;
        delete elt.comments;
        delete elt.forkOf;
        delete elt.views;
        elt.ids = [];
        elt.registrationState.registrationStatus = "Incomplete";
        delete elt.registrationState.administrativeStatus;
        $scope.elt = JSON.parse(JSON.stringify(elt));
        $scope.origName = $scope.elt.naming[0].designation;
        $scope.elt.naming[0].designation = "Copy of: " + $scope.elt.naming[0].designation;
        $scope.myOrgs = userResource.userOrgs;
    }

}