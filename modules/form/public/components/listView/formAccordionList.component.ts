import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { CdeForm } from 'shared/form/form.model';
import { Elt } from 'shared/models.model';
import { QuickBoardListService } from '_app/quickBoardList.service';

@Component({
    templateUrl: './formAccordionList.component.html'
})
export class FormAccordionListComponent {
    @Input() addMode: string = '';
    @Input() location: string = '';
    @Input() elts!: CdeForm[];
    @Input() openInNewTab = false;
    @Output() add = new EventEmitter<CdeForm>();

    module = 'form';
    Elt = Elt;

    constructor(public quickBoardService: QuickBoardListService) {
    }
}
