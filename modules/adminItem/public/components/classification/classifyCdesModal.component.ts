import { Component, Inject, Input, ViewChild, Output, EventEmitter, OnInit } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, NgbProgressbar } from "@ng-bootstrap/ng-bootstrap";
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
    selector: "cde-classify-cdes-modal",
    templateUrl: "classifyCdesModal.component.html",
    providers: [NgbActiveModal]
})
export class ClassifyCdesModalComponent implements OnInit {

    @ViewChild("classifyCdesContent") public classifyCdesContent: NgbModalModule;
    @ViewChild("classifyCdeBar") public classifyCdeBar: NgbProgressbar;
    @Input() elt: any;
    @Output() updateElt = new EventEmitter();
    allCdeId = [];
    public modalRef: NgbModalRef;
    selectedOrg: any;
    orgClassificationsTreeView: any;
    orgClassificationsRecentlyAddView: any;
    myOrgs: any;
    showProgressBar = false;
    numberProcessed;
    numberTotal;

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
                private alert: AlertService,
                @Inject("userResource") public userService) {
    }

    ngOnInit(): void {
        this.getChildren(this.elt.formElements, this.allCdeId);
    }

    getChildren(formElements, ids) {
        if (formElements)
            formElements.forEach(formElement => {
                if (formElement.elementType === "section" || formElement.elementType === "form") {
                    this.getChildren(formElement.formElements, ids);
                } else if (formElement.elementType === "question") {
                    ids.push({
                        id: formElement.question.cde.tinyId,
                        version: formElement.question.cde.version
                    });
                }
            });
    }

    openCdesModal() {
        this.modalRef = this.modalService.open(this.classifyCdesContent, {size: "lg"});
        this.myOrgs = this.userService.userOrgs;
        this.orgClassificationsTreeView = null;
        this.orgClassificationsRecentlyAddView = null;
        this.modalRef.result.then(result => {
            this.reloadElt(() => {
                if (result === "success")
                    this.alert.addAlert("success", "Classification added.");
                if (result === "exists")
                    this.alert.addAlert("warning", "Classification already exists.");
            });
        }, () => {
        });
    }

    onChangeOrg(value) {
        if (value) {
            //noinspection TypeScriptValidateTypes
            this.http.get("/org/" + encodeURIComponent(value)).map(res => res.json())
                .subscribe(
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
        classificationRecentlyAdd.eltId = this.elt._id;
        this.doClassifyPost(classificationRecentlyAdd);
    }

    doClassifyPost(post) {
        post["elements"] = this.allCdeId;
        //noinspection TypeScriptValidateTypes
        this.http.post("/classification/bulk/tinyId", post)
            .subscribe(res => {
                if (res["_body"] === "Done") {
                    this.modalRef.close("success");
                    this.alert.addAlert("success", "finished");
                }
                else if (res["_body"] === "Processing") {
                    let fn = setInterval(() => {
                        //noinspection TypeScriptValidateTypes
                        this.http.get("/bulkClassifyCdeStatus/" + this.elt._id).map(res => res.json())
                            .subscribe(
                                res => {
                                    this.showProgressBar = true;
                                    this.numberProcessed = res.numberProcessed;
                                    this.numberTotal = res.numberTotal;
                                    if (this.numberProcessed >= this.numberTotal) {
                                        this.http.get("/resetBulkClassifyCdesStatus/" + this.elt._id)
                                            .subscribe(() => {
                                                //noinspection TypeScriptUnresolvedFunction
                                                clearInterval(fn);
                                                this.modalRef.close("success");
                                            }, err => {
                                                this.alert.addAlert("danger", err);
                                            });
                                    }
                                },
                                err => {
                                    this.alert.addAlert("danger", err);
                                    this.modalRef.close("error");
                                });
                    }, 5000);
                }
            }, err => {
                this.alert.addAlert("danger", err);
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
        let postBody = {
            categories: classificationArray,
            eltId: this.elt._id,
            orgName: this.selectedOrg
        };
        this.doClassifyPost(postBody);
    }

    reloadElt(cb) {
        let url = this.elt.elementType === "cde" ? "dataElement/tinyId/" + this.elt.tinyId : "form/tinyId/" + this.elt.tinyId;
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