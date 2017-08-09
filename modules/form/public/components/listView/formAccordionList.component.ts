import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { CdeForm } from 'form/public/form.model';
import { Elt } from 'core/public/models.model';

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

    constructor(@Inject('QuickBoardListService') public quickBoardService) {
    }
}