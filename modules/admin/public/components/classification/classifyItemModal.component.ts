import { Component, Inject, Input, ViewChild, OnInit } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";
import { LocalStorageService } from "angular-2-local-storage/dist/index";
import { IActionMapping } from "angular-tree-component/dist/models/tree-options.model";
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
export class ClassifyItemModalComponent implements OnInit {

    @ViewChild("classifyItemContent") public classifyItemContent: NgbModalModule;

    public modalRef: NgbModalRef;
    @Input() elt: any;
    myOrgs: any;
    selectedOrg: any;
    orgClassificationsTreeView: any;
    orgClassificationsRecentlyAddView: any;
    type: any;
    options = {
        childrenField: "elements",
        displayField: "name",
        isExpandedField: "expanded",
        actionMapping: actionMapping
    };

    constructor(private http: Http,
                public modalService: NgbModal,
                private localStorageService: LocalStorageService,
                @Inject("Alert") private alert,
                @Inject("userResource") private userService,
                @Inject("OrgHelpers") private orgHelpers) {
    }

    ngOnInit(): void {
        this.myOrgs = this.userService.userOrgs;
        this.type = this.elt.formElement ? "form" : "CDE";
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
            this.orgClassificationsRecentlyAddView = [];
        }
    }

    open() {
        this.modalRef = this.modalService.open(this.classifyItemContent, {size: "lg"});
        this.modalRef.result.then(() => {
        }, () => {
        });
    }

    classifyItemByRecentlyAdd(classificationRecentlyAdd) {
        let newOrgClassificationsRecentlyAddView = this.orgClassificationsRecentlyAddView.filter(o => o === classificationRecentlyAdd);
        newOrgClassificationsRecentlyAddView.unshift(classificationRecentlyAdd);
        this.localStorageService.set("classificationHistory", newOrgClassificationsRecentlyAddView)
    }

    classifyItemByTree(treeNode) {
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
            (res) => {
                this.alert.addAlert("success", "Item Classified.");
            }, (err) => {
                this.alert.addAlert("danger", err);
            });
    }
}