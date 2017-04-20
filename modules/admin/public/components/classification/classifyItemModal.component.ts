import { Component, Inject, Input, ViewChild, Output, EventEmitter, OnInit } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";
import { LocalStorageService } from "angular-2-local-storage/dist";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
import { TreeNode } from "angular-tree-component/dist/models/tree-node.model";
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

    public modalRef: NgbModalRef;
    selectedOrg: any;
    orgClassificationsTreeView: any;
    orgClassificationsRecentlyAddView: any;
    myOrgs: any;

    options = {
        childrenField: "elements",
        displayField: "name",
        isExpandedField: "expanded",
        actionMapping: actionMapping
    };
    treeNode: TreeNode;

    constructor(private http: Http,
                public modalService: NgbModal,
                private localStorageService: LocalStorageService,
                @Inject("Alert") private alert,
                @Inject("userResource") public userService) {
    }

    onChangeOrg(value) {
        if (value) {
            //noinspection TypeScriptValidateTypes
            this.http.get("/org/" + value).map(res => res.json()).subscribe(
                (res) => {
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
        let newOrgClassificationsRecentlyAddView = this.orgClassificationsRecentlyAddView.filter(o => o === classificationRecentlyAdd);
        newOrgClassificationsRecentlyAddView.unshift(classificationRecentlyAdd);
        this.localStorageService.set("classificationHistory", newOrgClassificationsRecentlyAddView);
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
        let postBody = {
            categories: classificationArray,
            cdeId: this.elt._id,
            orgName: this.selectedOrg
        };
        //noinspection TypeScriptValidateTypes
        this.http.post("/classification/" + this.elt.elementType, postBody).map(res => res.json()).subscribe(
            () => {
                this.alert.addAlert("success", "Item classified.");
            }, err => this.alert.addAlert("danger", err));
    }
}