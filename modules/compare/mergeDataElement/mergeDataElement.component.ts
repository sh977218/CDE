import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { DeMergeFields } from 'compare/mergeDataElement/deMergeFields.model';
import { doMerge } from 'compare/mergeDe.service';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { DataElement } from 'shared/de/dataElement.model';

@Component({
    selector: 'cde-merge-data-element',
    templateUrl: './mergeDataElement.component.html',
    styleUrls: ['./mergeDataElement.component.scss'],
})
export class MergeDataElementComponent {
    @Input() source!: DataElement;
    @Input() destination!: DataElement;
    @Output() doneMerge = new EventEmitter<{ left: DataElement, right: DataElement }>();
    @ViewChild('mergeDataElementContent', {static: true}) mergeDataElementContent!: TemplateRef<any>;
    allow = true;
    dialogRef?: MatDialogRef<TemplateRef<any>>;
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
        sources: false
    };

    constructor(
        private alert: AlertService,
        public isAllowedModel: IsAllowedService,
        public dialog: MatDialog,
    ) {
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
        doMerge(this.source.tinyId, this.destination.tinyId, this.mergeFields).then(res => {
            this.alert.addAlert('success', 'Finished merging');
            this.doneMerge.emit(res);
            this.dialogRef?.close();
        }, err => this.alert.addAlert('danger', 'Unexpected error merging CDEs: ' + err));
    }

    openMergeDataElementModal() {
        this.dialogRef = this.dialog.open(this.mergeDataElementContent, {width: '1000px'});
    }
}
