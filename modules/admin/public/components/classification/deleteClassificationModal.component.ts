import { Component, Input, ViewChild, Injectable, Inject } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import "rxjs/add/operator/map";
import { Http, RequestOptions } from "@angular/http";
import { TreeNode } from "angular-tree-component/dist/models/tree-node.model";

@Component({
    selector: "cde-delete-classification-modal",
    templateUrl: "deleteClassificationModal.component.html",
    providers: [NgbActiveModal]
})
export class DeleteClassificationModalComponent {

    @ViewChild("deleteClassificationContent") public deleteClassificationModal: DeleteClassificationModalComponent;
    @Input() elt: any;
    public classificationString: any;
    public orgName: any;
    public node: TreeNode;

    constructor(private http: Http,
                public modalService: NgbModal,
                @Inject("Alert") private alert) {
    }

    deleteClassification() {
        let classificationArray = [this.node.data.name];
        let _treeNode = this.node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        let deleteBody = {
            categories: classificationArray,
            cdeId: this.elt._id,
            orgName: this.orgName
        };
        //noinspection TypeScriptValidateTypes
        this.http.delete("/classification/" + this.elt.elementType,
            new RequestOptions({body: deleteBody, method: 3})).subscribe(
            () => {}, (err) => {
                this.alert.addAlert("danger", err);
            });
    }
}