import { Component, Inject, Input, OnInit, ViewChild, QueryList, ViewChildren } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TREE_ACTIONS, TreeComponent } from "angular-tree-component";

import { ClassifyItemModalComponent } from "../../../adminItem/public/components/classification/classifyItemModal.component";
import * as ClassificationShared from "../../../system/shared/classificationShared.js"
import * as _ from "lodash";
import { AlertService } from "../../../system/public/components/alert/alert.service";

@Component({
    selector: "cde-create-data-element",
    providers: [NgbActiveModal],
    templateUrl: "./createDataElement.component.html"
})
export class CreateDataElementComponent implements OnInit {
    @ViewChild("classifyItemComponent") public classifyItemComponent: ClassifyItemModalComponent;
    @ViewChildren(TreeComponent) public classificationView: QueryList<TreeComponent>;
    @Input() elt;
    modalRef: NgbModalRef;

    cdes;

    constructor(@Inject("userResource") public userService,
                @Inject("isAllowedModel") public isAllowedModel,
                private http: Http,
                private alert: AlertService,
                @Inject("Elastic") private elasticService,
                @Inject("SearchSettings") private searchSettings) {
    }

    ngOnInit(): void {
        if (!this.elt) this.elt = {
            elementType: "cde",
            classification: [], stewardOrg: {}, naming: [{
                designation: "", definition: "", tags: []
            }]
        };
    }

    openClassifyItemModal() {
        this.modalRef = this.classifyItemComponent.openModal();
    }

    afterClassified(event) {
        let eltCopy = _.cloneDeep(this.elt);
        ClassificationShared.classifyItem(eltCopy, event.selectedOrg, event.classificationArray);
        this.elt = eltCopy;
        this.modalRef.close();
    }

    validationErrors(elt) {
        if (!elt.naming[0].designation) {
            return "Please enter a name for the new CDE";
        } else if (!elt.naming[0].definition) {
            return "Please enter a definition for the new CDE";
        } else if (!elt.stewardOrg.name) {
            return "Please select a steward for the new CDE";
        }
        if (elt.classification.length === 0) {
            return "Please select at least one classification";
        } else {
            var found = false;
            for (let i = 0; i < elt.classification.length; i++) {
                if (elt.classification[i].stewardOrg.name === elt.stewardOrg.name) {
                    found = true;
                }
            }
            if (!found) {
                return "Please select at least one classification owned by " + elt.stewardOrg.name;
            }
        }
        return null;
    };

    confirmDelete(event) {
        let eltCopy = _.cloneDeep(this.elt);
        let steward = ClassificationShared.findSteward(eltCopy, event.deleteOrgName);
        ClassificationShared.removeCategory(steward.object, event.deleteClassificationArray, err => {
            if (err) this.alert.addAlert("danger", err);
            else {
                this.elt = eltCopy;
                this.alert.addAlert("success", "Classification removed.");
            }
        });
    }

    showSuggestions = function () {
        if (!this.elt.naming[0].designation || this.elt.naming[0].designation.length < 3) return;
        let searchSettings = this.elasticService.defaultSearchSettings;
        searchSettings.q = this.elt.naming[0].designation;
        this.elasticService.generalSearchQuery(this.elasticService.buildElasticQuerySettings(searchSettings), "cde", (err, result) => {
            this.cdes = result.cdes;
        });
    };


    createDataElement() {
        this.http.post("/dataelement", this.elt).map(res => res.json())
            .subscribe(res => window.location.href = "/deview?tinyId=" + res.tinyId,
                err => this.alert.addAlert("danger", err));
    }
}
