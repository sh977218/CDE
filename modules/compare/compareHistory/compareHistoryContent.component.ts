import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Item } from 'shared/models.model';

@Component({
    templateUrl: './compareHistoryContent.component.html',
    styleUrls: ['./compareHistoryContent.component.scss'],
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

    constructor(@Inject(MAT_DIALOG_DATA) public data: { newer: Item, older: Item }) {
        this.newer = data.newer;
        this.older = data.older;
    }
}
