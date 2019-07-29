import { Component, Output, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'cde-question-answer-edit',
    templateUrl: './questionAnswerEditContent.component.html',
    providers: []
})
export class QuestionAnswerEditContentComponent {
    @Output() onCleared: EventEmitter<void> = new EventEmitter<void>();
    @Output() onSaved: EventEmitter<void> = new EventEmitter<void>();
    answers;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.answers = data.answers;
    }

}
