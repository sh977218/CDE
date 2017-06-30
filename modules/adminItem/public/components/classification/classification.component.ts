import { Component, Input, ViewChild, Inject } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
import { ClassifyItemModalComponent } from "./classifyItemModal.component";
import { ClassifyCdesModalComponent } from "./classifyCdesModal.component";
import { AlertService } from "../../../../system/public/components/alert/alert.service";

const actionMapping: IActionMapping = {
    mouse: {
        click: () => {
        },
        expanderClick: () => {
        }
    }
};

const urlMap = {
    "cde": "/removeCdeClassification/",
    "form": "/removeFormClassification/"
};

@Component({
    selector: "cde-admin-item-classification",
    providers: [NgbActiveModal],
    templateUrl: "./classification.component.html"
})
export class ClassificationComponent {
    @ViewChild("classifyItemComponent") public classifyItemComponent: ClassifyItemModalComponent;
    @ViewChild("classifyCdesComponent") public classifyCdesComponent: ClassifyCdesModalComponent;
    @ViewChild("deleteClassificationContent") public deleteClassificationContent: NgbModalModule;
    @Input() public elt: any;
    public modalRef: NgbModalRef;

    public deleteClassificationString: any;
    public deleteOrgName: any;
    public deleteClassificationArray: any;

    public options = {
        idField: "name",
        childrenField: "elements",
        displayField: "name",
        useVirtualScroll: false,
        isExpandedField: "elements",
        actionMapping: actionMapping
    };

    constructor(public http: Http,
                public modalService: NgbModal,
                private alert: AlertService,
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
        this.classifyItemComponent.openItemModal();
        this.classifyItemComponent.modalRef.result.then(result => {
            this.reloadElt(() => {
                if (result === "success")
                    this.alert.addAlert("success", "Classification added.");
                if (result === "exists")
                    this.alert.addAlert("warning", "Classification already exists.");
            });
        }, () => {
        });
    }

    openClassifyCdesModal() {
        this.classifyCdesComponent.openCdesModal();
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
        }, () => {
        });
    }

    deleteClassification() {
        let deleteBody = {
            categories: this.deleteClassificationArray,
            eltId: this.elt._id,
            orgName: this.deleteOrgName
        };
        this.http.post(urlMap[this.elt.elementType], deleteBody).subscribe(
            () => {
                this.modalRef.close("success");
            },
            () => {
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