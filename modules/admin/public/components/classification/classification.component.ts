import { Component, Input, ViewChild, Inject, OnInit } from "@angular/core";
import { NgbModalRef, NgbModal, NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
@Component({
    selector: "cde-admin-item-classification",
    providers: [NgbActiveModal],
    templateUrl: "./classification.component.html"
})
export class ClassificationComponent implements OnInit {
    @ViewChild("classificationContent") public classificationContent: NgbModalModule;
    @Input() public elt: any;
    public myOrgs: any;
    public selectedOrg;
    public modalRef: NgbModalRef;

    constructor(public modalService: NgbModal,
                public activeModal: NgbActiveModal,
                @Inject("Alert") private alert,
                @Inject("userResource") private userService,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("OrgHelpers") private orgHelpers) {
    }

    ngOnInit(): void {
        this.myOrgs = this.userService.userOrgs;
    }

    openClassificationModal() {
        this.modalRef = this.modalService.open(this.classificationContent);
        this.modalRef.result.then(result => {
        });
    }


}