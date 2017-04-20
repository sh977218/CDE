import { Component, Input, ViewChild, Inject, ViewChildren, QueryList } from "@angular/core";
import { NgbModalRef, NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ClassifyItemModalComponent } from "./classifyItemModal.component";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
import { DeleteClassificationModalComponent } from "./deleteClassificationModal.component";

import { Http } from "@angular/http";
import { map } from "rxjs/operator/map";

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
        childrenField: "elements",
        displayField: "name",
        isExpandedField: "elements",
        actionMapping: actionMapping
    };

    constructor(public http: Http,
                public modalService: NgbModal,
                public activeModal: NgbActiveModal,
                @Inject("Alert") private alert,
                @Inject("userResource") public userService,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    openClassifyItemModal() {
        this.classifyItemModal.myOrgs = this.userService.userOrgs;
        this.classifyItemModal.orgClassificationsTreeView = null;
        this.classifyItemModal.orgClassificationsRecentlyAddView = null;
        this.modalRef = this.modalService.open(this.classifyItemModal.classifyItemContent, {size: "lg"});
        this.modalRef.result.then(() => {
            let url = this.elt.elementType === "cde" ? "debytinyid/" + this.elt.tinyId : "formById/" + this.elt.tinyId;
            //noinspection TypeScriptValidateTypes
            this.http.get(url).map(res => res.json()).subscribe((res)=> {
                this.elt = res;
            }, (err) => {
                if (err) this.alert.addAlert("danger", "Error retrieving. " + err);
            });
        }, () => {
            let url = this.elt.elementType === "cde" ? "debytinyid/" + this.elt.tinyId : "formById/" + this.elt.tinyId;
            //noinspection TypeScriptValidateTypes
            this.http.get(url).map(res => res.json()).subscribe((res)=> {
                this.elt = res;
            }, (err) => {
                if (err) this.alert.addAlert("danger", "Error retrieving. " + err);
            });
        });
    }

    openDeleteClassificationModal(node, orgName) {
        this.deleteClassificationModal.node = node;
        this.deleteClassificationModal.classificationString = node.data.name;
        this.deleteClassificationModal.orgName = orgName;
        this.modalRef = this.modalService.open(this.deleteClassificationModal.deleteClassificationModal, {size: "lg"});
        this.modalRef.result.then(result => {
            let url = this.elt.elementType === "cde" ? "debytinyid/" + this.elt.tinyId : "formById/" + this.elt.tinyId;
            //noinspection TypeScriptValidateTypes
            this.http.get(url).map(res => res.json()).subscribe(res => {
                this.elt = res;
            }, err => {
                if (err) this.alert.addAlert("danger", "Error retrieving. " + err);
            });
        }, reason => {
            let url = this.elt.elementType === "cde" ? "debytinyid/" + this.elt.tinyId : "formById/" + this.elt.tinyId;
            //noinspection TypeScriptValidateTypes
            this.http.get(url).map(res => res.json()).subscribe(res => {
                this.elt = res;
            }, (err) => {
                if (err) this.alert.addAlert("danger", "Error retrieving. " + err);
            });
        });
    }

}