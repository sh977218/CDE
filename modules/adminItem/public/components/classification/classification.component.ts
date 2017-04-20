import { Component, Input, ViewChild, Inject } from "@angular/core";
import { Http, RequestOptions } from "@angular/http";
import { NgbModalRef, NgbModal, NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
import { ClassifyItemModalComponent } from "./classifyItemModal.component";

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
    @ViewChild("deleteClassificationContent") public deleteClassificationContent: NgbModalModule;
    @Input() public elt: any;
    public modalRef: NgbModalRef;

    public deleteClassificationString: any;
    public deleteOrgName: any;
    public deleteClassificationArray: any;

    public options = {
        childrenField: "elements",
        displayField: "name",
        useVirtualScroll: false,
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

    searchByClassification(node, orgName) {
        let classificationArray = [node.data.name];
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                classificationArray.unshift(_treeNode.data.name);
        }
        return "/" + this.elt.elementType + "/search?selectedOrg=" + encodeURIComponent(orgName) +
            "&classification=" + encodeURIComponent(classificationArray.join(";"));

    };

    openClassifyItemModal() {
        this.classifyItemModal.openModal();
    }

    openDeleteClassificationModal(node, orgName) {
        this.deleteClassificationString = node.data.name;
        this.deleteClassificationArray = [node.data.name];
        this.deleteOrgName = orgName;
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                this.deleteClassificationArray.unshift(_treeNode.data.name);
        }
        this.modalRef = this.modalService.open(this.deleteClassificationContent);
        this.modalRef.result.then(result => {
            this.reloadElt(() => {
                if (result === "success")
                    this.alert.addAlert("success", "Classification removed.");
            });
        }, reason => {
        });
    }

    deleteClassification() {
        let deleteBody = {
            categories: this.deleteClassificationArray,
            cdeId: this.elt._id,
            orgName: this.deleteOrgName
        };
        this.http.delete("/classification/" + this.elt.elementType,
            new RequestOptions({body: deleteBody, method: 3})).subscribe(
            () => {
                this.modalRef.close("success");
            },
            err => {
                this.modalRef.close("error");
            });
    }

    reloadElt(cb) {
        let url = this.elt.elementType === "cde" ? "debytinyid/" + this.elt.tinyId : "formById/" + this.elt.tinyId;
        //noinspection TypeScriptValidateTypes
        this.http.get(url).map(res => res.json()).subscribe(res => {
            this.elt = res;
            if (cb) cb();
        }, err => {
            if (err) this.alert.addAlert("danger", "Error retrieving. " + err);
            if (cb) cb();
        });
    }

    updateThisElt(event) {
        this.elt = event;
    }

}