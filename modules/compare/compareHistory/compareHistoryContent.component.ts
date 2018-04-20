import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "cde-compare-history",
    templateUrl: "./compareHistoryContent.component.html",
    styles: [`
        caption {
            caption-side: top;
        }

        .color-box {
            width: 10px;
            height: 10px;
        }

        .isSelected {
            background-color: #f5f5f5;
        }

        #reorderIcon{
            background-color: #fad000;
        }
        #addIcon{
            background-color: #008000;
        }
        #removeIcon{
            background-color: #a94442;
        }
        #editIcon{
            background-color: #0000ff;
        }
    `],
    providers: []
})
export class CompareHistoryContentComponent {
    newer;
    older;

    public filter = {
        reorder: {
            select: true
        },
        add: {
            select: true
        },
        remove: {
            select: true
        },
        edited: {
            select: true
        }
    };

    constructor(public activeModal: NgbActiveModal) {
    }
}