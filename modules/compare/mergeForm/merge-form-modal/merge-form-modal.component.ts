import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormMergeFields } from 'compare/mergeForm/formMergeFields.model';
import { MergeFormService } from 'compare/mergeForm.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IsAllowedService } from 'non-core/isAllowed.service';
import { AlertService } from 'alert/alert.service';

@Component({
    selector: 'cde-merge-form-modal',
    templateUrl: './merge-form-modal.component.html',
    styleUrls: ['./merge-form-modal.component.scss'],
})
export class MergeFormModalComponent {
    mergeFields: FormMergeFields = {
        designations: true,
        definitions: true,
        referenceDocuments: true,
        properties: true,
        ids: true,
        classifications: true,
        questions: true,
        cde: {
            designations: true,
            definitions: true,
            referenceDocuments: true,
            properties: true,
            attachments: true,
            dataSets: true,
            derivationRules: true,
            sources: true,
            ids: true,
            classifications: true,
            retireCde: false
        }
    };
    showProgressBar = false;
    finishMerge = false;

    source;
    destination;
    doneMerge = new EventEmitter();

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<MergeFormModalComponent>,
                public alert: AlertService,
                public isAllowedModel: IsAllowedService,
                public mergeFormService: MergeFormService) {
        this.source = data.source;
        this.destination = data.destination;
        this.mergeFormService.validateQuestions(this.source, this.destination, this.mergeFields);
    }

    unselectAllCdeMergerFields() {
        this.mergeFields.cde.designations = false;
        this.mergeFields.cde.definitions = false;
        this.mergeFields.cde.referenceDocuments = false;
        this.mergeFields.cde.properties = false;
        this.mergeFields.cde.ids = false;
        this.mergeFields.cde.classifications = false;
    }

    unselectAllFormMergerFields() {
        this.mergeFields.designations = false;
        this.mergeFields.definitions = false;
        this.mergeFields.referenceDocuments = false;
        this.mergeFields.properties = false;
        this.mergeFields.ids = false;
        this.mergeFields.cde.attachments = false;
        this.mergeFields.cde.dataSets = false;
        this.mergeFields.cde.derivationRules = false;
        this.mergeFields.cde.sources = false;
        this.mergeFields.classifications = false;
        this.mergeFields.questions = false;
    }

    selectAllCdeMergerFields() {
        this.mergeFields.cde.designations = true;
        this.mergeFields.cde.definitions = true;
        this.mergeFields.cde.referenceDocuments = true;
        this.mergeFields.cde.properties = true;
        this.mergeFields.cde.ids = true;
        this.mergeFields.cde.attachments = true;
        this.mergeFields.cde.dataSets = true;
        this.mergeFields.cde.derivationRules = true;
        this.mergeFields.cde.sources = true;
        this.mergeFields.cde.classifications = true;
    }

    selectAllFormMergerFields() {
        this.mergeFields.designations = true;
        this.mergeFields.definitions = true;
        this.mergeFields.referenceDocuments = true;
        this.mergeFields.properties = true;
        this.mergeFields.ids = true;
        this.mergeFields.classifications = true;
        this.mergeFields.questions = true;
    }

    doMerge() {
        this.showProgressBar = true;
        this.mergeFormService.doMerge(this.source, this.destination, this.mergeFields).then(res => {
            if (this.mergeFormService.error.ownSourceForm) {
                this.source.changeNote = 'Merge to tinyId ' + this.destination.tinyId;
                if (this.isAllowedModel.isAllowed(this.source)) {
                    this.source.registrationState.registrationStatus = 'Retired';
                }
                this.mergeFormService.saveForm({
                    form: this.source, cb: (err: any) => {
                        if (err) {
                            this.alert.addAlert('danger', 'Can not save source form.');
                        } else {
                            this.destination.changeNote = 'Merge from tinyId ' + this.source.tinyId;
                            this.mergeFormService.saveForm({
                                form: this.destination, cb: (err: any) => {
                                    if (err) {
                                        this.alert.addAlert('danger', 'Can not save target form.');
                                    } else {
                                        this.finishMerge = true;
                                        this.alert.addAlert('success', 'Form merged');
                                        setTimeout(() => {
                                            this.showProgressBar = false;
                                            return;
                                        }, 3000);
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                this.destination.changeNote = 'Merge from tinyId ' + this.source.tinyId;
                this.mergeFormService.saveForm({
                    form: this.destination, cb: (err: any) => {
                        if (err) {
                            this.alert.addAlert('danger', 'Cannot save target form.');
                        } else {
                            this.finishMerge = true;
                            this.alert.addAlert('success', 'Form merged');
                            setTimeout(() => {
                                this.showProgressBar = false;
                                this.doneMerge.emit({left: this.source, right: this.destination});
                                return;
                            }, 3000);
                        }
                    }
                });
            }
        }, err => this.alert.addAlert('danger', 'Unexpected error merging forms: ' + err));
    }

}
