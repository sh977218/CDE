import { Component, Output, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { PermissibleValue } from 'shared/models.model';

@Component({
    selector: 'cde-question-answer-edit',
    templateUrl: './questionAnswerEditContent.component.html',
    providers: []
})
export class QuestionAnswerEditContentComponent {
    @Output() cleared: EventEmitter<void> = new EventEmitter<void>();
    @Output() saved: EventEmitter<void> = new EventEmitter<void>();
    answers: PermissibleValue;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.answers = data.answers;
    }
}
