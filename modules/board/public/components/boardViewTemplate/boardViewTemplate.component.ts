import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgbModalModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

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
    @ViewChild('editBoardContent') newNamingContent: NgbModalModule;
    @Input() board: any;
    @Input() canEdit: boolean;

    @Output() save = new EventEmitter();

    tags = [];
    types = ['cde', 'form'];

    constructor(public modalService: NgbModal) {
    }

    openEditBoardModal() {
        this.modalService.open(this.newNamingContent, {size: 'sm'});
    }
}