import { Component, Input, ViewChild } from '@angular/core';
import { SortableComponent } from 'ngx-bootstrap/sortable';
import { MergeFieldsForm, MergeFormService } from 'non-core/mergeForm.service';
import { CompareForm } from 'compare/compareSideBySide/compareSideBySide.component';

@Component({
    selector: 'cde-sortable',
    templateUrl: './cdeSortable.component.html'
})
export class CdeSortableComponent {
    @Input() left!: CompareForm;
    @Input() right!: CompareForm;
    @Input() mergeFields!: MergeFieldsForm;
    @ViewChild('sortableComponent', {static: false}) sortableComponent!: SortableComponent;

    constructor(private mergeFormService: MergeFormService) {
    }

    addItem() {
        this.left.questions.push({
            elementType: 'question',
            formElements: [],
            question: {
                cde: {tinyId: '', name: '', definitions: [], derivationRules: [], designations: [], ids: []},
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
        if (index === undefined) { index = -1; }
        this.left.questions.splice(index, 1);
        this.sortableComponent.writeValue(this.left.questions);
        this.mergeFormService.validateQuestions(this.left, this.right, this.mergeFields);
    }
}
