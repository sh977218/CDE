import { Component, Input, ViewChild } from '@angular/core';
import { SortableComponent } from 'ngx-bootstrap/sortable';
import { FormMergeFields } from 'compare/mergeForm/formMergeFields.model';
import { MergeFormService } from 'compare/mergeForm.service';
import { CompareForm } from 'compare/compareSideBySide/compare-form';

@Component({
    selector: 'cde-sortable',
    templateUrl: './cdeSortable.component.html',
    styleUrls: ['./cdeSortable.component.scss'],
})
export class CdeSortableComponent {
    @Input() left!: CompareForm;
    @Input() right!: CompareForm;
    @Input() mergeFields!: FormMergeFields;
    @ViewChild('sortableComponent', {static: true}) sortableComponent!: SortableComponent;

    constructor(private mergeFormService: MergeFormService) {
    }

    addItem() {
        this.left.questions.push({
            elementType: 'question',
            formElements: [],
            question: {
                cde: {tinyId: '', name: '', derivationRules: [], ids: []},
                datatype: 'Text',
                datatypeText: {},
                unitsOfMeasure: [],
                uomsAlias: [],
                uomsValid: []
            }
        });
        this.sortableComponent.writeValue(this.left.questions);
        this.mergeFormService.validateQuestions(this.left, this.right, this.mergeFields);
    }

    removeItem(index: number) {
        if (index === undefined) {
            index = -1;
        }
        this.left.questions.splice(index, 1);
        this.sortableComponent.writeValue(this.left.questions);
        this.mergeFormService.validateQuestions(this.left, this.right, this.mergeFields);
    }
}
