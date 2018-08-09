import { Component, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "cde-question-answer-edit",
    templateUrl: "./questionAnswerEditContent.component.html",
    providers: []
})
export class QuestionAnswerEditContentComponent {
    @Output() onCleared: EventEmitter<void> = new EventEmitter<void>();
    @Output() onSaved: EventEmitter<void> = new EventEmitter<void>();
    answers;

    constructor(public activeModal: NgbActiveModal) {
    }
}
