import { Component, Input } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
    templateUrl: './questionAccordingList.component.html',
    selector: 'question-according-list',
    imports: [NgIf, NgForOf, MatIconModule, RouterLink],
    standalone: true,
})
export class QuestionAccordionListComponent {
    @Input() formElements: any[] = [];
}
