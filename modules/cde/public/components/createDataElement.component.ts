import { Component, Inject, Input, OnInit, ViewChild, QueryList, ViewChildren } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TREE_ACTIONS, TreeComponent } from "angular-tree-component";

import { ClassifyItemModalComponent } from "../../../adminItem/public/components/classification/classifyItemModal.component";
import * as ClassificationShared from "../../../system/shared/classificationShared.js"

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

    constructor(@Inject("userResource") public userService,
                @Inject("isAllowedModel") public isAllowedModel,
                private http: Http) {
    }

    ngOnInit(): void {
        if (!this.elt) this.elt = {
            elementType: "cde",
            classification: [], stewardOrg: {}, naming: [{
                designation: "", definition: "", tags: []
            }]
        };
    }

    updateThisElt(event) {
        console.log(event);
    }

    openClassifyItemModal() {
        this.modalRef = this.classifyItemComponent.openModal();
    }

    afterClassified(event) {
        ClassificationShared.classifyItem(this.elt, event.selectedOrg, event.classificationArray);
        this.classificationView.forEach(t => {
            t.treeModel.update();
        });
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
            for (var i = 0; i < elt.classification.length; i++) {
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
}
