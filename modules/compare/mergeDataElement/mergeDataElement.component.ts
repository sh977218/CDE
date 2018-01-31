import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbModalModule, NgbModal, NgbActiveModal, NgbModalRef, } from '@ng-bootstrap/ng-bootstrap';

import { AlertService } from '_app/alert/alert.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { MergeCdeService } from 'core/mergeCde.service';


@Component({
    selector: 'cde-merge-data-element',
    providers: [NgbActiveModal],
    templateUrl: './mergeDataElement.component.html'
})
export class MergeDataElementComponent {
    @Input() public source: any;
    @Input() public destination: any;
    @Output() doneMerge = new EventEmitter();
    @ViewChild('mergeDataElementContent') public mergeDataElementContent: NgbModalModule;
    allow = true;
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
    modalRef: NgbModalRef;

    constructor(
        private alert: AlertService,
        public isAllowedModel: IsAllowedService,
        public mergeCdeService: MergeCdeService,
        public modalService: NgbModal,
    ) {
    }

    allowToMerge() {
        this.allow = true;
        if (this.mergeFields.retireCde) {
            this.allow = this.allow && this.isAllowedModel.isAllowed(this.source);
        }
        if (this.mergeFields.ids ||
            this.mergeFields.naming ||
            this.mergeFields.properties ||
            this.mergeFields.attachments ||
            this.mergeFields.sources ||
            this.mergeFields.referenceDocuments ||
            this.mergeFields.dataSets ||
            this.mergeFields.derivationRules) {
            this.allow = this.allow && this.isAllowedModel.isAllowed(this.destination);
        }
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

    doMerge() {
        let tinyIdFrom = this.source.tinyId;
        let tinyIdTo = this.destination.tinyId;
        this.mergeCdeService.doMerge(tinyIdFrom, tinyIdTo, this.mergeFields, (err, results) => {
            if (err) return this.alert.addAlert('danger', err);
            else {
                this.alert.addAlert('success', 'Finished merging');
                this.doneMerge.emit({left: results[0], right: results[1]});
                this.modalRef.close();
            }
        });
    }

    openMergeDataElementModal() {
        this.modalRef = this.modalService.open(this.mergeDataElementContent, {size: 'lg'});
    }
}
