import { Component, Input } from '@angular/core';
import { Elt } from 'shared/models.model';
import { CdeFormElastic } from 'shared/form/form.model';
import { FormSummaryListContentComponent } from 'form/listView/formSummaryListContent.component';

@Component({
    selector: 'cde-linked-forms',
    templateUrl: './linkedForms.component.html',
    styleUrls: ['./linkedForms.component.scss'],
})
export class LinkedFormsComponent {
    @Input() elt!: Elt;
    @Input() forms: CdeFormElastic[] = [];

    formSummaryContentComponent = FormSummaryListContentComponent;
}
