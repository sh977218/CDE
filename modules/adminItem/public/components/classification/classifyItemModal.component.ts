import { HttpClient } from '@angular/common/http';
import { Component, Input, ViewChild, Output, EventEmitter } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageService } from "angular-2-local-storage/dist";
import { TreeNode } from "angular-tree-component/dist/models/tree-node.model";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";

import { UserService } from '_app/user.service';
import { ClassificationService } from 'core/classification.service';

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        }
    }
};


@Component({
    selector: "cde-classify-item-modal",
    templateUrl: "classifyItemModal.component.html",
    providers: [NgbActiveModal]
})
export class ClassifyItemModalComponent {
    @Input() modalTitle: string = "Classify this CDE";
    @Output() onEltSelected = new EventEmitter();
    @ViewChild("classifyItemContent") classifyItemContent: NgbModalModule;
    modalRef: NgbModalRef;
    orgClassificationsTreeView: any;
    orgClassificationsRecentlyAddView: any;
    options = {
        idField: "name",
        childrenField: "elements",
        displayField: "name",
        isExpandedField: "expanded",
        actionMapping: actionMapping
    };
    selectedOrg: any;
    treeNode: TreeNode;

    constructor(
        private classificationSvc: ClassificationService,
        private http: HttpClient,
        private localStorageService: LocalStorageService,
        public modalService: NgbModal,
        public userService: UserService,
    ) {
    }

    classifyItemByRecentlyAdd(classificationRecentlyAdd) {
        this.classificationSvc.updateClassificationLocalStorage({
            categories: classificationRecentlyAdd.categories,
            orgName: classificationRecentlyAdd.orgName
        });
        this.onEltSelected.emit({
            classificationArray: classificationRecentlyAdd.categories,
            selectedOrg: classificationRecentlyAdd.orgName,
        });
    }

    classifyItemByTree(treeNode) {
        this.treeNode = treeNode;
        let classificationArray = [treeNode.data.name];
        let _treeNode = treeNode;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        this.classificationSvc.updateClassificationLocalStorage({
            categories: classificationArray,
            orgName: this.selectedOrg
        });
        this.onEltSelected.emit({
            classificationArray: classificationArray,
            selectedOrg: this.selectedOrg
        });
    }

    onChangeClassifyView(event) {
        if (event.nextId === "recentlyAddViewTab") {
            this.orgClassificationsRecentlyAddView = this.localStorageService.get("classificationHistory");
        } else {
            this.orgClassificationsTreeView = null;
        }
    }

    onChangeOrg(value) {
        if (value) {
            let url = "/org/" + encodeURIComponent(value);
            //noinspection TypeScriptValidateTypes
            this.http.get(url).subscribe(
                res => {
                    this.selectedOrg = value;
                    this.orgClassificationsTreeView = res;
                }, () => {
                    this.orgClassificationsTreeView = {};
                });
        } else this.orgClassificationsTreeView = [];
    }

    openModal() {
        this.orgClassificationsTreeView = null;
        this.orgClassificationsRecentlyAddView = null;
        if (this.selectedOrg) {
            this.onChangeOrg(this.selectedOrg);
        } else this.userService.then(() => {
            if (this.userService.userOrgs.length === 1) this.onChangeOrg(this.userService.userOrgs[0]);
        });
        return this.modalService.open(this.classifyItemContent);
    }
}
