import { Component, Inject } from '@angular/core';
import { ValidationWhitelist } from 'shared/models.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'cde-add-white-list-modal',
    templateUrl: './add-white-list-modal.component.html',
    styles: [`
      .example-chip-list {
        width: 100%;
      }
    `]
})
export class AddWhiteListModalComponent {
    newWhiteList: ValidationWhitelist = {
        collectionName: '',
        terms: []
    };

    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    constructor(@Inject(MAT_DIALOG_DATA) public selectedWhiteList: ValidationWhitelist) {
        if (selectedWhiteList) {
            this.newWhiteList = cloneDeep(selectedWhiteList);
            this.newWhiteList.collectionName = `Copy of ${selectedWhiteList.collectionName}`
        }
    }

    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // Add our fruit
        if (value) {
            this.newWhiteList.terms.push(value);
        }

        // Clear the input value
        event.chipInput!.clear();
    }

    remove(term: string) {
        const index = this.newWhiteList.terms.indexOf(term);

        if (index >= 0) {
            this.newWhiteList.terms.splice(index, 1);
        }
    }
}
