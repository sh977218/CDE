import { Component, Inject, Input, ViewChild, Output, EventEmitter } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
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
    @Output() updateElt = new EventEmitter();

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

    openModal() {
        this.modalRef = this.modalService.open(this.classifyItemContent, {size: "lg"});
        this.myOrgs = this.userService.userOrgs;
        this.orgClassificationsTreeView = null;
        this.orgClassificationsRecentlyAddView = null;
        this.modalRef.result.then(result => {
            this.reloadElt(() => {
                if (result === "success")
                    this.alert.addAlert("success", "Classification added.");
            });
        }, reason => {
        });
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
            () => this.modalRef.close("success"), err => {
                this.alert.addAlert("danger", err);
                this.modalRef.close("error");
            });
    }

    reloadElt(cb) {
        let url = this.elt.elementType === "cde" ? "debytinyid/" + this.elt.tinyId : "formById/" + this.elt.tinyId;
        //noinspection TypeScriptValidateTypes
        this.http.get(url).map(res => res.json()).subscribe(res => {
            this.updateElt.emit(res);
            if (cb) cb();
        }, err => {
            if (err) this.alert.addAlert("danger", "Error retrieving. " + err);
            if (cb) cb();
        });
    }
}