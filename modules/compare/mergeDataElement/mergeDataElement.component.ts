import { Component, Inject, Input, OnInit, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from 'system/public/components/alert/alert.service';
import { MergeFormService } from 'core/public/mergeForm.service';

@Component({
    selector: "cde-merge-data-element",
    providers: [NgbActiveModal],
    templateUrl: "./mergeDataElement.component.html"
})
export class MergeDataElementComponent implements OnInit {
    @ViewChild("mergeDataElementContent") public mergeDataElementContent: NgbModalModule;
    @Input() public source: any;
    @Input() public destination: any;
    public modalRef: NgbModalRef;
    mergeRequest: any;

    constructor(private alert: AlertService,
                public mergeFormService: MergeFormService,
                @Inject("isAllowedModel") private isAllowedModel,
                @Inject('userResource') private userService,
                public modalService: NgbModal) {
    }

    ngOnInit(): void {
        this.mergeRequest = {
            source: {tinyId: this.source.tinyId, object: this.destination.source},
            destination: {tinyId: this.destination.target.tinyId, object: this.destination.target},
            mergeFields: {
                classifications: true,
                ids: false,
                naming: false,
                properties: false,
                attachments: false,
                sources: false,
                referenceDocuments: false,
                dataSets: false,
                derivationRules: false
            }
        };
    }


    checkAllMergerFields() {
        this.mergeRequest.mergeFields.classifications = true;
        this.mergeRequest.mergeFields.ids = true;
        this.mergeRequest.mergeFields.naming = true;
        this.mergeRequest.mergeFields.properties = true;
        this.mergeRequest.mergeFields.attachments = true;
        this.mergeRequest.mergeFields.sources = true;
        this.mergeRequest.mergeFields.referenceDocuments = true;
        this.mergeRequest.mergeFields.dataSets = true;
        this.mergeRequest.mergeFields.derivationRules = true;
    }

    approvalNecessary() {
        return {
            fieldsRequireApproval: this.mergeRequest.mergeFields.ids ||
            this.mergeRequest.mergeFields.naming ||
            this.mergeRequest.mergeFields.properties ||
            this.mergeRequest.mergeFields.attachments ||
            this.mergeRequest.mergeFields.sources ||
            this.mergeRequest.mergeFields.referenceDocuments ||
            this.mergeRequest.mergeFields.dataSets ||
            this.mergeRequest.mergeFields.derivationRules,
            ownDestinationCde: this.userService.user.orgAdmin.concat(this.userService.user.orgCurator).indexOf(this.mergeRequest.destination.object.stewardOrg.name) > -1
        };
    };

    showApprovalAlert() {
        return this.approvalNecessary().fieldsRequireApproval &&
            !this.approvalNecessary().ownDestinationCde;
    }

    openMergeDataElementModal() {
        this.modalRef = this.modalService.open(this.mergeDataElementContent, {size: "lg"});
    }

    sendMergeRequest() {
        return {
            /*
                        mergeRequest: this.mergeRequest,
                        recipient: this.target.stewardOrg.name,
                        author: this.userService.user.username,
                        approval: this.approvalNecessary()
            */
        }
    }
}