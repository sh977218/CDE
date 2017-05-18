import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import * as _ from "lodash";

@Component({
    selector: "cde-inline-edit",
    templateUrl: "inlineEdit.component.html",
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
export class InlineEditComponent implements OnInit {
    @Input() model: any = "";
    @Input() inputType: string = "text";
    @Input() selectOptions: Array<any> = [];
    @Input() isAllowed: boolean = false;
    @Output() onOk = new EventEmitter();
    @Output() onEdit = new EventEmitter();

    public editMode: boolean = false;
    public value: any;

    ngOnInit(): void {
        if (!this.inputType) this.inputType = 'text';
        this.value = _.cloneDeep(this.model);
    }

    edit() {
        this.editMode = true;
        this.onEdit.emit();
    }

    discard() {
        this.value = _.cloneDeep(this.model);
        this.editMode = false;
    }

    save() {
        this.model = _.cloneDeep(this.value);
        this.editMode = false;
        this.onOk.emit(this.model);
    }

}