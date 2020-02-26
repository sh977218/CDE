import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item } from 'shared/models.model';

@Component({
    templateUrl: './compareHistoryContent.component.html',
    styles: [`
        caption {
            caption-side: top;
        }
        #addIcon{
            background-color: #008000;
        }
        #editIcon{
            background-color: #0000ff;
        }
        #removeIcon{
            background-color: #a94442;
        }
        #reorderIcon{
            background-color: #fad000;
        }
        .color-box {
            width: 10px;
            height: 10px;
        }
        .isSelected {
            background-color: #f5f5f5;
        }
    `],
    providers: []
})
export class CompareHistoryContentComponent {
    newer: Item;
    older: Item;
    filter = {
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

    constructor(@Inject(MAT_DIALOG_DATA) public data: {newer: Item, older: Item}) {
        this.newer = data.newer;
        this.older = data.older;
    }
}
