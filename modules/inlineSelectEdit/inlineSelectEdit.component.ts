import { Component, EventEmitter, Input, Output } from '@angular/core';
import { deepCopy } from 'shared/util';

@Component({
    selector: 'cde-inline-select-edit',
    templateUrl: './inlineSelectEdit.component.html',
})
export class InlineSelectEditComponent {
    @Input() value = 'N/A';
    @Input() selectOptions = [];
    @Input() isAllowed = false;
    @Output() save = new EventEmitter<string>();
    @Input() cdeTooltip = '';
    @Input() cdeTooltipClass =  'cdeTooltipMultiline';
    @Input() cdeTooltipPosition = 'below'
    _value!: string;
    editMode = false;

    confirmSave() {
        this.save.emit(this._value);
        this.editMode = false;
    }

    discard() {
        this.editMode = false;
    }

    edit() {
        this._value = deepCopy(this.value);
        this.editMode = true;
    }
}
