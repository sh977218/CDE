import { Component, Input, ViewChild } from '@angular/core';
import { SortableComponent } from 'ngx-bootstrap/sortable';
import { MergeFormService } from 'non-core/mergeForm.service';

@Component({
    selector: 'cde-sortable',
    templateUrl: './cdeSortable.component.html'
})
export class CdeSortableComponent {
    @Input() public left: any;
    @Input() public right: any;
    @Input() public mergeFields: any;
    @ViewChild('sortableComponent') sortableComponent: SortableComponent;

    constructor(private mergeFormService: MergeFormService) {
    }

    addItem() {
        this.left.questions.push({question: {cde: {tinyId: '', name: ''}}});
        this.sortableComponent.writeValue(this.left.questions);
        this.mergeFormService.validateQuestions(this.left, this.right, this.mergeFields);
    }

    removeItem(index) {
        if (index === undefined) { index = -1; }
        this.left.questions.splice(index, 1);
        this.sortableComponent.writeValue(this.left.questions);
        this.mergeFormService.validateQuestions(this.left, this.right, this.mergeFields);

    }

}
