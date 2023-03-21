import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdeForm } from 'shared/form/form.model';
import { Elt, ModuleItem } from 'shared/models.model';

@Component({
    templateUrl: './formAccordionList.component.html',
})
export class FormAccordionListComponent {
    @Input() addMode: string = '';
    @Input() location: string = '';
    @Input() elts!: CdeForm[];
    @Input() openInNewTab = false;
    @Output() add = new EventEmitter<CdeForm>();

    module: ModuleItem = 'form';
    Elt = Elt;
}
