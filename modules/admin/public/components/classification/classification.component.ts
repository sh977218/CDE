import { Component, Input, ViewChild, Inject, ViewChildren, QueryList } from "@angular/core";
import { NgbModalRef, NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ClassifyItemModalComponent } from "./classifyItemModal.component";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
import { DeleteClassificationModalComponent } from "./deleteClassificationModal.component";

import * as classificationShared from "../../../../../modules/system/shared/classificationShared.js";

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        },
        expanderClick: () => {
        }
    }
};

@Component({
    selector: "cde-admin-item-classification",
    providers: [NgbActiveModal],
    templateUrl: "./classification.component.html"
})
export class ClassificationComponent {

    @ViewChild("classifyItemModal") public classifyItemModal: ClassifyItemModalComponent;
    @ViewChild("deleteClassificationModal") public deleteClassificationModal: DeleteClassificationModalComponent;
    @Input() public elt: any;
    public modalRef: NgbModalRef;

    public options = {
        idField: "name",
        childrenField: "elements",
        displayField: "name",
        isExpandedField: "elements",
        actionMapping: actionMapping
    };

    constructor(public modalService: NgbModal,
                public activeModal: NgbActiveModal,
                @Inject("Alert") private alert,
                @Inject("userResource") public userService,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    openClassifyItemModal() {
        this.modalRef = this.modalService.open(this.classifyItemModal.classifyItemContent, {size: "lg"});
    }

    closeModal(e) {
        classificationShared.classifyItem(this.elt, e.org, e.selectClassifications);
        this.alert.addAlert("success", "Item Classified.");
    }

}