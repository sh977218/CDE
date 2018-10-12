import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

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

    constructor(@Inject(MAT_DIALOG_DATA) public data) {
        this.newer = data.newer;
        this.older = data.older;
    }
}