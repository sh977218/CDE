import { Component, Input, ViewChild, Inject } from "@angular/core";
import { Http } from "@angular/http";
import { NgbModalRef, NgbModal, NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
import { ClassifyItemModalComponent } from "./classifyItemModal.component";
import { ClassifyCdesModalComponent } from "./classifyCdesModal.component";
import { AlertService } from "../../../../system/public/components/alert/alert.service";
import { LocalStorageService } from "angular-2-local-storage/dist";
import * as _ from "lodash";

const urlMap = {
    "cde": {
        delete: "/removeCdeClassification/",
        add: "/addCdeClassification/",
        get: "debytinyid/",
    },
    "form": {
        delete: "/removeFormClassification/",
        add: "/addFormClassification/",
        get: "formById/"
    }
};

@Component({
    selector: "cde-admin-item-classification",
    providers: [NgbActiveModal],
    templateUrl: "./classification.component.html"
})
export class ClassificationComponent {
    @ViewChild("classifyItemComponent") public classifyItemComponent: ClassifyItemModalComponent;
    @ViewChild("classifyCdesComponent") public classifyCdesComponent: ClassifyCdesModalComponent;
    @Input() public elt: any;
    public modalRef: NgbModalRef;

    constructor(public http: Http,
                private localStorageService: LocalStorageService,
                private alert: AlertService,
                @Inject("userResource") public userService,
                @Inject("isAllowedModel") public isAllowedModel) {
    }

    openClassifyItemModal() {
        this.modalRef = this.classifyItemComponent.openModal();
    }

    openClassifyCdesModal() {
        this.classifyCdesComponent.openCdesModal();
    }

    confirmDelete(event) {
        let node = event.node;
        let deleteClassificationArray = [node.data.name];
        let deleteOrgName = event.selectedOrg;
        let _treeNode = node;
        while (_treeNode.parent) {
            _treeNode = _treeNode.parent;
            if (!_treeNode.data.virtual)
                deleteClassificationArray.unshift(_treeNode.data.name);
        }
        let deleteBody = {
            categories: deleteClassificationArray,
            eltId: this.elt._id,
            orgName: deleteOrgName
        };
        this.http.post(urlMap[this.elt.elementType].delete, deleteBody)
            .map(res => res.json()).subscribe(res => {
            this.elt = res;
            this.alert.addAlert("success", "Classification removed.");
        }, err => this.alert.addAlert("danger", err));
    }

    reloadElt(cb) {
        let url = urlMap[this.elt.elementType].get + this.elt.tinyId;
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


    afterClassified(event) {
        let postBody = {
            categories: event.classificationArray,
            eltId: this.elt._id,
            orgName: event.selectedOrg
        };

        this.http.post(urlMap[this.elt.elementType].add, postBody).subscribe(
            () => {
                this.updateClassificationLocalStorage(postBody);
                this.reloadElt(() => {
                    this.modalRef.close("success");
                    this.alert.addAlert("success", "Classified.");
                })
            }, err => {
                this.alert.addAlert("danger", err._body);
                this.modalRef.close("error");
            });
    }

    updateClassificationLocalStorage(item) {
        let recentlyClassification = <Array<any>>this.localStorageService.get("classificationHistory");
        if (!recentlyClassification) recentlyClassification = [];
        recentlyClassification = recentlyClassification.filter(o => {
            if (o.cdeId) o.eltId = o.cdeId;
            return _.isEqual(o, item);
        });
        recentlyClassification.unshift(item);
        this.localStorageService.set("classificationHistory", recentlyClassification);
    }

}