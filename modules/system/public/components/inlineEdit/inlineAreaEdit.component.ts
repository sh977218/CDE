import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from "@angular/core";

import * as _ from "lodash";

@Component({
    selector: "cde-inline-area-edit",
    templateUrl: "./inlineAreaEdit.component.html",
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
export class InlineAreaEditComponent implements OnInit {
    @Input() model;
    @Input() inputType: string = "text";
    @Input() selectOptions: Array<any> = [];
    @Input() isAllowed: boolean = false;
    @Input() defFormat: String = "";
    @Output() modelChange = new EventEmitter<string>();

    public INPUT_TYPE_ARRAY = ["text", "email", "number"];

    public editMode: boolean = false;
    public value: any;

    ngOnInit(): void {
        if (!this.inputType) this.inputType = 'text';
        this.value = _.cloneDeep(this.model);
    }

    setHtml (html) {
        this.defFormat = html ? 'html' : '';
    }

    edit() {
        this.editMode = true;
    }

    discard() {
        this.value = _.cloneDeep(this.model);
        this.editMode = false;
    }

    save() {
        this.editMode = false;
        this.modelChange.emit(this.value);
    }

}