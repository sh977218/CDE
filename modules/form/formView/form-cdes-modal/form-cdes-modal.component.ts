import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { QuestionAccordionListComponent } from 'cde/listView/questionAccordingList/questionAccordingList.component';
import { FormQuestion } from 'shared/form/form.model';

@Component({
    templateUrl: './form-cdes-modal.component.html',
    imports: [QuestionAccordionListComponent, MatDialogModule],
    standalone: true,
})
export class FormCdesModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public questions: FormQuestion[]) {}
}
