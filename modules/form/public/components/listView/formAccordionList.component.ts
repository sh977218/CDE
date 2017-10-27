import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { CdeForm } from 'core/form.model';
import { Elt } from 'core/models.model';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';

@Component({
    selector: 'cde-form-accordion-list',
    templateUrl: './formAccordionList.component.html'
})
export class FormAccordionListComponent {
    @Input() addMode: any = null;
    @Input() location: string = null;
    @Input() elts: CdeForm[];
    @Input() openInNewTab: boolean = false;
    @Output() add = new EventEmitter<CdeForm>();

    module = 'form';
    Elt = Elt;

    constructor(public quickBoardService: QuickBoardListService) {
    }
}