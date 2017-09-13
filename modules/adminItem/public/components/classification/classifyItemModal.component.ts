import { Component, Inject, Input, ViewChild, Output, EventEmitter } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageService } from "angular-2-local-storage/dist";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
import { TreeNode } from "angular-tree-component/dist/models/tree-node.model";
import { AlertService } from "../../../../system/public/components/alert/alert.service";
import { ClassificationService } from "../../../../core/public/classification.service";

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
    @ViewChild("classifyItemContent") public classifyItemContent: NgbModalModule;
    @Input() modalTitle: string = "Classify this CDE";
    @Output() onEltSelected = new EventEmitter();

    public modalRef: NgbModalRef;
    selectedOrg: any;
    orgClassificationsTreeView: any;
    orgClassificationsRecentlyAddView: any;

    options = {
        idField: "name",
        childrenField: "elements",
        displayField: "name",
        isExpandedField: "expanded",
        actionMapping: actionMapping
    };
    treeNode: TreeNode;

    constructor(private http: Http,
                public modalService: NgbModal,
                private localStorageService: LocalStorageService,
                @Inject("userResource") public userService,
                private classificationSvc: ClassificationService) {
    }

    openModal() {
        this.orgClassificationsTreeView = null;
        this.orgClassificationsRecentlyAddView = null;
        if (this.selectedOrg) {
            this.onChangeOrg(this.selectedOrg);
        } else this.userService.getPromise().then(() => {
            if (this.userService.userOrgs.length === 1) this.onChangeOrg(this.userService.userOrgs[0]);
        });
        return this.modalService.open(this.classifyItemContent, {size: "lg"});
    }

    onChangeOrg(value) {
        if (value) {
            let url = "/org/" + encodeURIComponent(value);
            //noinspection TypeScriptValidateTypes
            this.http.get(url).map(res => res.json()).subscribe(
                res => {
                    this.selectedOrg = value;
                    this.orgClassificationsTreeView = res;
                }, () => {
                    this.orgClassificationsTreeView = {};
                });
        } else this.orgClassificationsTreeView = [];
    }

    onChangeClassifyView(event) {
        if (event.nextId === "recentlyAddViewTab") {
            this.orgClassificationsRecentlyAddView = this.localStorageService.get("classificationHistory");
        } else {
            this.orgClassificationsTreeView = null;
        }
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
}