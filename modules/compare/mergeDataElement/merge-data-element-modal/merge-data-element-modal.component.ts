import { Component, EventEmitter, Inject } from '@angular/core';
import { DeMergeFields } from 'compare/mergeDataElement/deMergeFields.model';
import { AlertService } from 'alert/alert.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MergeDeService } from '../../mergeDe.service';

@Component({
    templateUrl: './merge-data-element-modal.component.html',
    styleUrls: ['./merge-data-element-modal.component.scss'],
})
export class MergeDataElementModalComponent {
    mergeFields: DeMergeFields = {
        attachments: false,
        classifications: true,
        dataSets: false,
        definitions: false,
        derivationRules: false,
        designations: false,
        ids: false,
        properties: false,
        referenceDocuments: false,
        retireCde: true,
        sources: false,
    };
    allow = true;
    doneMerge = new EventEmitter();

    source;
    destination;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialogRef: MatDialogRef<MergeDataElementModalComponent>,
        private alert: AlertService,
        public isAllowedModel: IsAllowedService,
        private deService: MergeDeService
    ) {
        this.source = data.source;
        this.destination = data.destination;
    }

    allowToMerge() {
        this.allow = true;
        if (this.mergeFields.retireCde) {
            this.allow = this.allow && this.isAllowedModel.isAllowed(this.source);
        }
        if (
            this.mergeFields.ids ||
            this.mergeFields.designations ||
            this.mergeFields.definitions ||
            this.mergeFields.properties ||
            this.mergeFields.attachments ||
            this.mergeFields.sources ||
            this.mergeFields.referenceDocuments ||
            this.mergeFields.dataSets ||
            this.mergeFields.derivationRules
        ) {
            this.allow = this.allow && this.isAllowedModel.isAllowed(this.destination);
        }
    }

    selectAllMergerFields() {
        this.mergeFields.classifications = true;
        this.mergeFields.ids = true;
        this.mergeFields.designations = true;
        this.mergeFields.definitions = true;
        this.mergeFields.properties = true;
        this.mergeFields.attachments = true;
        this.mergeFields.sources = true;
        this.mergeFields.referenceDocuments = true;
        this.mergeFields.dataSets = true;
        this.mergeFields.derivationRules = true;
        this.mergeFields.retireCde = true;
    }

    unselectAllMergerFields() {
        this.mergeFields.classifications = false;
        this.mergeFields.ids = false;
        this.mergeFields.designations = false;
        this.mergeFields.definitions = false;
        this.mergeFields.properties = false;
        this.mergeFields.attachments = false;
        this.mergeFields.sources = false;
        this.mergeFields.referenceDocuments = false;
        this.mergeFields.dataSets = false;
        this.mergeFields.derivationRules = false;
        this.mergeFields.retireCde = false;
    }

    doMerge() {
        this.deService.doMerge(this.source.tinyId, this.destination.tinyId, this.mergeFields).then(
            res => {
                this.alert.addAlert('success', 'Finished merging');
                this.doneMerge.emit(res);
                this.dialogRef.close();
            },
            err => this.alert.addAlert('danger', 'Unexpected error merging CDEs: ' + err)
        );
    }
}
