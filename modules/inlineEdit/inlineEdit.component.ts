import { Component, EventEmitter, Input, Output } from '@angular/core';

type InputTypes = 'date' | 'email' | 'number' | 'select' | 'text' | 'textArea';

@Component({
    selector: 'cde-inline-edit',
    templateUrl: './inlineEdit.component.html',
    styleUrls: ['./inlineEdit.component.scss'],
})
export class InlineEditComponent {
    private _model!: string;
    @Input() set model(v: string) {
        this._model = v;
        if (!this.inputType) {
            this.inputType = 'text';
        }
        this.value = v;
    }
    get model() {
        return this._model;
    }
    @Input() inputType: InputTypes = 'text';
    @Input() selectOptions = [];
    @Input() isAllowed: boolean = false;
    @Input() linkSource!: string;
    @Input() placeholder: string = '';
    @Output() modelChange = new EventEmitter<string>();
    editMode = false;
    value!: string;

    discard() {
        this.value = this.model;
        this.editMode = false;
    }

    edit() {
        this.editMode = true;
    }

    save() {
        this.editMode = false;
        this.modelChange.emit(this.value);
    }
}
