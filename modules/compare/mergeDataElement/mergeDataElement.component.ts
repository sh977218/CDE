import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { AlertService } from 'alert/alert.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { MergeCdeService, MergeFieldsDe } from 'non-core/mergeCde.service';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-merge-data-element',
    templateUrl: './mergeDataElement.component.html'
})
export class MergeDataElementComponent {
    @Input() source!: DataElement;
    @Input() destination!: DataElement;
    @Output() doneMerge = new EventEmitter<{left: DataElement, right: DataElement}>();
    @ViewChild('mergeDataElementContent') mergeDataElementContent!: TemplateRef<any>;
    allow = true;
    dialogRef!: MatDialogRef<TemplateRef<any>>;
    mergeFields: MergeFieldsDe = {
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
        sources: false
    };

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
        this.mergeCdeService.doMerge(tinyIdFrom, tinyIdTo, this.mergeFields, (err?: string, results?: [DataElement, DataElement]) => {
            if (err || !results) {
                return this.alert.addAlert('danger', 'Unexpected error merging CDEs');
            }
            this.alert.addAlert('success', 'Finished merging');
            this.doneMerge.emit({left: results[0], right: results[1]});
            this.dialogRef.close();
        });
    }

    openMergeDataElementModal() {
        this.dialogRef = this.dialog.open(this.mergeDataElementContent, {width: '1000px'});
    }
}
