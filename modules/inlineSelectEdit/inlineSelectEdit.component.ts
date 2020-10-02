import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as _cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'cde-inline-select-edit',
    templateUrl: './inlineSelectEdit.component.html',
    styles: [`
        button {
            display: inline-block;
            margin-bottom: 0;
            font-weight: normal;
            text-align: center;
            vertical-align: middle;
            cursor: pointer;
            border: 1px solid #cccccc;
            white-space: nowrap;
            color: #333333;
            background-color: #ffffff;
            padding: 5px 10px;
            font-size: 12px;
            line-height: 1.5;
            border-radius: 3px;
        }
        mat-icon {
            font-size: 16px;
            height: 16px;
            width: 16px;
            vertical-align: middle;
        }
    `]
})
export class InlineSelectEditComponent {
    @Input() value = 'N/A';
    @Input() selectOptions = [];
    @Input() isAllowed = false;
    @Output() save = new EventEmitter<string>();
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
        this._value = _cloneDeep(this.value);
        this.editMode = true;
    }
}
