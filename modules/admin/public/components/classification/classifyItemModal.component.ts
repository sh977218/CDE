import { Component, Inject, Input, ViewChild, OnInit } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";
import { LocalStorageService } from "angular-2-local-storage/dist/index";

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
        if (value)
        //noinspection TypeScriptValidateTypes
            this.http.get("/org/" + value).map(res => res.json()).subscribe(
                (res) => {
                    this.orgClassificationsTreeView = res;
                }, () => {
                    this.orgClassificationsTreeView = {};
                });
        else this.orgClassificationsTreeView = [];
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
}