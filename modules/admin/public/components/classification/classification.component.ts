import { Component, Input, ViewChild, Inject, OnInit, ViewChildren, QueryList } from "@angular/core";
import { NgbModalRef, NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ClassifyItemModalComponent } from "./classifyItemModal.component";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
import { DeleteClassificationModalComponent } from "./deleteClassificationModal.component";
import { TreeComponent } from "angular-tree-component/dist/components/tree.component";

import * as classificationShared from "../../../../../modules/system/shared/classificationShared.js"
import * as authorizationShared from "../../../../../modules/system/shared/authorizationShared.js"

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
export class ClassificationComponent implements OnInit {
    @ViewChild("classifyItemModal") public classifyItemModal: ClassifyItemModalComponent;
    @ViewChild("deleteClassificationModal") public deleteClassificationModal: DeleteClassificationModalComponent;
    @ViewChildren("treeRoot") treeRootComponents: QueryList<TreeComponent>;
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
    public isOrgCurator;

    constructor(public modalService: NgbModal,
                public activeModal: NgbActiveModal,
                @Inject("Alert") private alert,
                @Inject("userResource") private userService,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    ngOnInit(): void {
        this.isOrgCurator = authorizationShared.isOrgCurator(this.userService.user);
        this.myOrgs = this.userService.userOrgs ? this.userService.userOrgs : [];
    }

    openClassifyItemModal() {
        this.modalRef = this.modalService.open(this.classifyItemModal.classifyItemContent, {size: "lg"});
    }

    closeModal(e) {
        classificationShared.classifyItem(this.elt, e.org, e.selectClassifications);
        this.alert.addAlert("success", "Item Classified.");
    }

}