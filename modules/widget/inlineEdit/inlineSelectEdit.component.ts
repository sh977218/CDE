import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import * as _ from "lodash";

@Component({
    selector: "cde-inline-select-edit",
    templateUrl: "./inlineSelectEdit.component.html",
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
    `]
})
export class InlineSelectEditComponent {
    @Input() value: string = 'N/A';
    @Input() selectOptions: Array<any> = [];
    @Input() isAllowed: boolean = false;
    @Output() save = new EventEmitter<string>();

    _value;
    public editMode: boolean = false;

    edit() {
        this._value = _.cloneDeep(this.value);
        this.editMode = true;
    }

    discard() {
        this.editMode = false;
    }

    confirmSave() {
        this.save.emit(this._value);
        this.editMode = false;
    }
}