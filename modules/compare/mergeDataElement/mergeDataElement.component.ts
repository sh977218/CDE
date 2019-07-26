import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { AlertService } from 'alert/alert.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { MergeCdeService } from 'non-core/mergeCde.service';
import { MatDialog, MatDialogRef } from '@angular/material';

@Component({
    selector: 'cde-merge-data-element',
    templateUrl: './mergeDataElement.component.html'
})
export class MergeDataElementComponent {
    @Input() public source: any;
    @Input() public destination: any;
    @Output() doneMerge = new EventEmitter();
    @ViewChild('mergeDataElementContent') public mergeDataElementContent: TemplateRef<any>;
    allow = true;
    mergeFields: any = {
        classifications: true,
        ids: false,
        designations: false,
        definitions: false,
        properties: false,
        attachments: false,
        sources: false,
        referenceDocuments: false,
        dataSets: false,
        derivationRules: false,
        retireCde: true
    };
    dialogRef: MatDialogRef<TemplateRef<any>>;

    constructor(private alert: AlertService,
                public isAllowedModel: IsAllowedService,
                public mergeCdeService: MergeCdeService,
                public dialog: MatDialog) {
    }

    allowToMerge() {
        this.allow = true;
        if (this.mergeFields.retireCde) {
            this.allow = this.allow && this.isAllowedModel.isAllowed(this.source);
        }
        if (this.mergeFields.ids ||
            this.mergeFields.designations ||
            this.mergeFields.definitions ||
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

    doMerge() {
        const tinyIdFrom = this.source.tinyId;
        const tinyIdTo = this.destination.tinyId;
        this.mergeCdeService.doMerge(tinyIdFrom, tinyIdTo, this.mergeFields, (err, results) => {
            if (err) { return this.alert.addAlert('danger', 'Unexpected error merging CDEs'); }
            else {
                this.alert.addAlert('success', 'Finished merging');
                this.doneMerge.emit({left: results[0], right: results[1]});
                this.dialogRef.close();
            }
        });
    }

    openMergeDataElementModal() {
        this.dialogRef = this.dialog.open(this.mergeDataElementContent, {width: '1000px'});
    }
}
