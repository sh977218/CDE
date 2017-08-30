import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
    selector: 'cde-board-view-template',
    templateUrl: './boardViewTemplate.component.html',
})
export class BoardViewTemplateComponent implements OnInit {

    @Input() board: any;
    @Input() canEditBoard: boolean;
    @Input() suggestTags = [];
    @Input() index: number;

    @Output() save = new EventEmitter();

    currentTags = [];

    options = {
        tags: true,
        multiple: true
    };

    ngOnInit () {
        this.currentTags = this.board.tags;
    }

    tagsChanged ($event) {
        this.board.tags = $event.value;
        console.log(this.board.tags)
    }

}