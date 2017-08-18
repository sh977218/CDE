import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from "@angular/core";
import "rxjs/add/operator/map";
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from "@ng-bootstrap/ng-bootstrap";
import { AlertService } from 'system/public/components/alert/alert.service';
import { Http } from '@angular/http';
import { MergeCdeService } from 'core/public/mergeCde.service';

@Component({
    selector: "cde-merge-data-element",
    providers: [NgbActiveModal],
    templateUrl: "./mergeDataElement.component.html"
})
export class MergeDataElementComponent {
    @ViewChild("mergeDataElementContent") public mergeDataElementContent: NgbModalModule;
    @Input() public source: any;
    @Input() public destination: any;
    @Output() doneMerge = new EventEmitter();
    public modalRef: NgbModalRef;
    mergeFields: any = {
        classifications: true,
        ids: false,
        naming: false,
        properties: false,
        attachments: false,
        sources: false,
        referenceDocuments: false,
        dataSets: false,
        derivationRules: false,
        retireCde: true
    };

    constructor(private http: Http,
                public modalService: NgbModal,
                private alert: AlertService,
                public mergeCdeService: MergeCdeService,
                @Inject("isAllowedModel") private isAllowedModel,
                @Inject('userResource') private userService) {
    }

    checkAllMergerFields() {
        this.mergeFields.classifications = true;
        this.mergeFields.ids = true;
        this.mergeFields.naming = true;
        this.mergeFields.properties = true;
        this.mergeFields.attachments = true;
        this.mergeFields.sources = true;
        this.mergeFields.referenceDocuments = true;
        this.mergeFields.dataSets = true;
        this.mergeFields.derivationRules = true;
        this.mergeFields.retireCde = true;
    }

    approvalNecessary() {
        return {
            fieldsRequireApproval: this.mergeFields.ids ||
            this.mergeFields.naming ||
            this.mergeFields.properties ||
            this.mergeFields.attachments ||
            this.mergeFields.sources ||
            this.mergeFields.referenceDocuments ||
            this.mergeFields.dataSets ||
            this.mergeFields.derivationRules,
            ownDestinationCde: this.userService.user.orgAdmin.concat(this.userService.user.orgCurator).indexOf(this.destination.stewardOrg.name) > -1
        };
    };

    showApprovalAlert() {
        return this.approvalNecessary().fieldsRequireApproval && !this.approvalNecessary().ownDestinationCde;
    }

    openMergeDataElementModal() {
        this.modalRef = this.modalService.open(this.mergeDataElementContent, {size: "lg"});
    }

    doMerge() {
        let tinyIdFrom = this.source.tinyId;
        let tinyIdTo = this.destination.tinyId;
        this.mergeCdeService.doMerge(tinyIdFrom, tinyIdTo, this.mergeFields, (err, results) => {
            if (err) return this.alert.addAlert("danger", err);
            else {
                this.alert.addAlert("success", "Finished merging");
                this.doneMerge.emit({left: results[0], right: results[1]});
                this.modalRef.close();
            }
        });
    }
}