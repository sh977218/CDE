import { Component, Input, ViewChild, Inject } from "@angular/core";
import { NgbModalRef, NgbModal, NgbActiveModal, NgbModalModule } from "@ng-bootstrap/ng-bootstrap";
@Component({
    selector: "cde-classification",
    providers: [NgbActiveModal],
    templateUrl: "classification.component"
})
export class ClassificationComponent {
    @ViewChild("newClassificationContent") public newClassificationContent: NgbModalModule;
    @Input() public elt: any;
    public modalRef: NgbModalRef;

    constructor(public modalService: NgbModal,
                public activeModal: NgbActiveModal,
                @Inject("Alert") private alert,
                @Inject("isAllowedModel") public isAllowedModel,
                @Inject("OrgHelpers") private orgHelpers) {

    }

    openClassificationModal() {
        this.modalRef = this.modalService.open(this.newClassificationContent, {size: "lg"});
        this.modalRef.result.then(result => {

        });
    }


}