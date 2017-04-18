import { Component, Input, ViewChild, Inject, OnInit } from "@angular/core";
import { NgbModalRef, NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ClassifyItemModalComponent } from "./classifyItemModal.component";
import { IActionMapping, TREE_ACTIONS } from "angular-tree-component/dist/models/tree-options.model";
import { DeleteClassificationModalComponent } from "./deleteClassificationModal.component";

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
    public myOrgs: any;
    public selectedOrg;
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
                @Inject("userResource") private userService,
                @Inject("isAllowedModel") public isAllowedModel) {
    }


}