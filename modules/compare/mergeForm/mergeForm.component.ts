import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

import { AlertService } from 'alert/alert.service';
import { IsAllowedService } from 'core/isAllowed.service';
import { MergeFormService } from 'core/mergeForm.service';
import { MatDialog } from '@angular/material';

@Component({
    selector: 'cde-merge-form',
    templateUrl: './mergeForm.component.html'
})
export class MergeFormComponent {
    @Input() public left: any;
    @Input() public right: any;
    @Output() doneMerging = new EventEmitter();
    @ViewChild('mergeFormContent') public mergeFormContent: TemplateRef<any>;
    doneMerge: boolean = false;
    maxNumberQuestions: any;
    mergeFields: any = {
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
    numMergedQuestions: any;
    showProgressBar: boolean = false;

    constructor(private alert: AlertService,
                public isAllowedModel: IsAllowedService,
                public mergeFormService: MergeFormService,
                public dialog: MatDialog) {
    }

    deselectAllCdeMergerFields() {
        this.mergeFields.cde.designations = false;
        this.mergeFields.cde.definitions = false;
        this.mergeFields.cde.referenceDocuments = false;
        this.mergeFields.cde.properties = false;
        this.mergeFields.cde.ids = false;
        this.mergeFields.cde.classifications = false;
    }

    deselectAllFormMergerFields() {
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

    doMerge() {
        this.showProgressBar = true;
        this.maxNumberQuestions = this.right.questions.length;
        this.mergeFormService.doMerge(this.left, this.right, this.mergeFields, (index, next) => {
            this.numMergedQuestions = index;
            next();
        }, err => {
            if (err) return this.alert.addAlert('danger', "Unexpected error merging forms");
            else {
                if (this.mergeFormService.error.ownSourceForm) {
                    this.left.changeNote = 'Merge to tinyId ' + this.right.tinyId;
                    if (this.isAllowedModel.isAllowed(this.left)) this.left.registrationState.registrationStatus = 'Retired';
                    this.mergeFormService.saveForm(this.left, err => {
                        if (err) this.alert.addAlert('danger', 'Can not save source form.');
                        else {
                            this.right.changeNote = 'Merge from tinyId ' + this.left.tinyId;
                            this.mergeFormService.saveForm(this.right, err => {
                                if (err) this.alert.addAlert('danger', 'Can not save target form.');
                                else {
                                    this.doneMerge = true;
                                    this.alert.addAlert('success', 'Form merged');
                                    setTimeout(() => {
                                        this.showProgressBar = false;
                                        return;
                                    }, 3000);
                                }
                            });
                        }
                    });
                } else {
                    this.right.changeNote = 'Merge from tinyId ' + this.left.tinyId;
                    this.mergeFormService.saveForm(this.right, err => {
                        if (err) this.alert.addAlert('danger', 'Cannot save target form.');
                        else {
                            this.doneMerge = true;
                            this.alert.addAlert('success', 'Form merged');
                            setTimeout(() => {
                                this.showProgressBar = false;
                                this.doneMerging.emit({left: this.left, right: this.right});
                                return;
                            }, 3000);
                        }
                    });
                }
            }
        });
    }

    openMergeFormModal() {
        this.mergeFormService.validateQuestions(this.left, this.right, this.mergeFields);
        this.dialog.open(this.mergeFormContent, {width: '1000px'});
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
}
