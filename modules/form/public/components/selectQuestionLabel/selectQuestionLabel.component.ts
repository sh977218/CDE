import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'alert/alert.service';
import { FormQuestion, FormSection, Question } from 'shared/form/form.model';
import { DataElement } from 'shared/de/dataElement.model';
import { ITEM_MAP } from 'shared/item';
import { Designation } from 'shared/models.model';

export interface SelectQuestionLabelData {
    question: FormQuestion;
    parent: FormSection;
}

export type SelectQuestionLabelOutput = Designation | null | undefined;

@Component({
    selector: 'cde-select-question-label',
    templateUrl: 'selectQuestionLabel.component.html'
})
export class SelectQuestionLabelComponent {
    cde?: DataElement;
    question: Question;
    section: FormSection;

    constructor(private http: HttpClient,
                private alert: AlertService,
                public dialogRef: MatDialogRef<SelectQuestionLabelComponent, SelectQuestionLabelOutput>,
                @Inject(MAT_DIALOG_DATA) data: SelectQuestionLabelData) {
        this.question = data.question.question;
        this.section = data.parent;
        if (!this.question.cde.tinyId) {
            this.alert.addAlert('danger', 'This question does not have a tinyId.');
            this.dialogRef.close();
            return;
        }
        let url = ITEM_MAP.cde.api + this.question.cde.tinyId;
        if (this.question.cde.version) {
            url += '/version/' + this.question.cde.version;
        }
        this.http.get<DataElement>(url).subscribe(
            res => this.cde = res,
            () => {
                this.alert.addAlert('danger', 'Error loading CDE.');
                this.dialogRef.close();
            }
        );
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
