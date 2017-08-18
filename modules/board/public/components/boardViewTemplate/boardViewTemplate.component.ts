import {Component, Input, Output} from "@angular/core";
import {EventEmitter} from "selenium-webdriver";

@Component({
    selector: 'cde-board-view-template',
    templateUrl: './boardViewTemplate.component.html',
})
export class BoardViewTemplateComponent {

    @Input() board: any;
    @Input() canEditBoard: boolean;
    @Input() index: number;

    @Output() save = new EventEmitter();

}