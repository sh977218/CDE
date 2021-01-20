import { Component, EventEmitter, Input, Output } from '@angular/core';
import * as _cloneDeep from 'lodash/cloneDeep';
import { assertUnreachable } from 'shared/models.model';

type inputTypes = 'date' | 'email' | 'number' | 'select' | 'text' | 'textArea';

@Component({
    selector: 'cde-inline-edit',
    templateUrl: './inlineEdit.component.html',
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
            height: 1em;
            line-height: 1.5em;
            width: 1.2em;
            vertical-align: top;
        }
    `]
})
export class InlineEditComponent {
    private _model!: string;
    @Input() set model(v: any) {
        this._model = v;
        if (!this.inputType) { this.inputType = 'text'; }
        this.value = _cloneDeep(v);
    }
    get model() {
        return this._model;
    }
    @Input() inputType: inputTypes = 'text';
    @Input() selectOptions = [];
    @Input() isAllowed = false;
    @Input() linkSource!: string;
    @Output() modelChange = new EventEmitter<string>();
    INPUT_TYPE_ARRAY = ['text', 'email'];
    editMode = false;
    value!: string;

    discard() {
        this.value = _cloneDeep(this.model);
        this.editMode = false;
    }

    edit() {
        this.editMode = true;
    }

    isNotNA(value: any): boolean {
        switch (this.inputType) {
            case 'number':
                return !isNaN(value);
            case 'date':
            case 'email':
            case 'select':
            case 'text':
            case 'textArea':
                return !!value;
            default:
                throw assertUnreachable(this.inputType);
        }
    }

    save() {
        this.editMode = false;
        this.modelChange.emit(this.value);
    }
}
