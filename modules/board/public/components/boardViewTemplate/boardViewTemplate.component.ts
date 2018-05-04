import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: 'cde-board-view-template',
    templateUrl: './boardViewTemplate.component.html',
    styles: [`
        .myBoardTags {
            position: absolute;
            bottom: 7px;
        }
    `]
})
export class BoardViewTemplateComponent {

    @Input() board: any;
    @Input() canEditBoard: boolean;
    @Input() suggestTags = [];
    @Input() index: number;

    @Output() save = new EventEmitter();

    tags = [];
}