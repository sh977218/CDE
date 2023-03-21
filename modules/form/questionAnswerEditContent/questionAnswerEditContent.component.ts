import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PermissibleValue } from 'shared/models.model';

export interface QuestionAnswerEditContentData {
    answers: PermissibleValue[];
}

export type QuestionAnswerEditContentOutput = PermissibleValue[] | 'clear' | undefined;

@Component({
    templateUrl: './questionAnswerEditContent.component.html',
    providers: [],
})
export class QuestionAnswerEditContentComponent {
    answers: PermissibleValue[];

    constructor(
        public dialogRef: MatDialogRef<QuestionAnswerEditContentComponent, QuestionAnswerEditContentOutput>,
        @Inject(MAT_DIALOG_DATA) public data: QuestionAnswerEditContentData
    ) {
        this.answers = data.answers;
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
