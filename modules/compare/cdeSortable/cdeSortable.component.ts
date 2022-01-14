import { Component, Input, ViewChild } from '@angular/core';
import { SortableComponent } from 'ngx-bootstrap/sortable';
import { CompareForm } from 'compare/compareSideBySide/compareSideBySide.component';
import { FormMergeFields } from 'compare/mergeForm/formMergeFields.model';
import { MergeFormService } from 'compare/mergeForm.service';

@Component({
    selector: 'cde-sortable',
    templateUrl: './cdeSortable.component.html',
    styles: [`
        .no-left-right-padding {
            padding-left: 0;
            padding-right: 0;
        }

        .no-left-right-margin {
            margin-left: 0;
            margin-right: 0;
        }

        div.mergeCdeName {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            height: 24px;
        }
    `]
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
