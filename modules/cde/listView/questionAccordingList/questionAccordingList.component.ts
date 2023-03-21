import { Component, Input } from '@angular/core';

@Component({
    templateUrl: './questionAccordingList.component.html',
    selector: 'question-according-list',
})
export class QuestionAccordionListComponent {
    @Input() formElements: any[] = [];
}
