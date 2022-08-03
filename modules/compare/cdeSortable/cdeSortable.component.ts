import { Component, Input } from '@angular/core';
import { FormMergeFields } from 'compare/mergeForm/formMergeFields.model';
import { MergeFormService } from 'compare/mergeForm.service';
import { CompareForm } from 'compare/compareSideBySide/compare-form';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'cde-sortable',
    templateUrl: './cdeSortable.component.html',
    styleUrls: ['./cdeSortable.component.scss'],
})
export class CdeSortableComponent {
    @Input() left!: CompareForm;
    @Input() right!: CompareForm;
    @Input() mergeFields!: FormMergeFields;

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
        this.mergeFormService.validateQuestions(this.left, this.right, this.mergeFields);
    }

    removeItem(index: number) {
        if (index === undefined) {
            index = -1;
        }
        this.left.questions.splice(index, 1);
        this.mergeFormService.validateQuestions(this.left, this.right, this.mergeFields);
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.left.questions, event.previousIndex, event.currentIndex);
    }
}
