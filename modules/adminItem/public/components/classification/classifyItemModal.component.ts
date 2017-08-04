import { Component, Inject, Input, ViewChild, Output, EventEmitter } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageService } from "angular-2-local-storage/dist";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
import { TreeNode } from "angular-tree-component/dist/models/tree-node.model";
import { AlertService } from "../../../../system/public/components/alert/alert.service";

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
    @Input() elt: any;
    @Output() afterClassified = new EventEmitter();

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
                @Inject("userResource") public userService) {
    }

    openModal() {
        this.orgClassificationsTreeView = null;
        this.orgClassificationsRecentlyAddView = null;
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
        this.afterClassified.emit({
            eltId: this.elt._id,
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
        this.afterClassified.emit({
            classificationArray: classificationArray,
            selectedOrg: this.selectedOrg
        });
    }
}