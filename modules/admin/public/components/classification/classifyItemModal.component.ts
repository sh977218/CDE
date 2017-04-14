import { Component, Inject, Input, ViewChild, OnInit } from "@angular/core";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import "rxjs/add/operator/map";
import { Http } from "@angular/http";

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
    orgClassifications: any;

    constructor(private http: Http,
                public modalService: NgbModal,
                @Inject("Alert") private alert,
                @Inject("userResource") private userService,
                @Inject("OrgHelpers") private orgHelpers) {
    }

    ngOnInit(): void {
        this.myOrgs = this.userService.userOrgs;
    }

    onChange(value) {
        //noinspection TypeScriptValidateTypes
        this.http.get("/org/" + value).map(res => res.json()).subscribe(
            (res) => {
                this.orgClassifications = res.classifications;
            }, () => {
            })
    }

    open() {
        this.modalRef = this.modalService.open(this.classifyItemContent, {size: "lg"});
        this.modalRef.result.then(()=> {
        }, ()=> {
        });
    }
}