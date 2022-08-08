import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidationWhitelist } from 'shared/models.model';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { cloneDeep } from 'lodash';

@Component({
    templateUrl: './edit-white-list-modal.component.html',
    styles: [`
      .example-chip-list {
        width: 100%;
      }
    `]
})
export class EditWhiteListModalComponent {
    oldTerms = [];
    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    constructor(@Inject(MAT_DIALOG_DATA) public selectedWhiteList: ValidationWhitelist) {
        this.oldTerms = cloneDeep(selectedWhiteList.terms);
    }


    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // Add our fruit
        if (value) {
            this.selectedWhiteList.terms.push(value);
        }

        // Clear the input value
        event.chipInput!.clear();
    }

    remove(term: string) {
        const index = this.selectedWhiteList.terms.indexOf(term);

        if (index >= 0) {
            this.selectedWhiteList.terms.splice(index, 1);
        }
    }

    cancelChanges() {
        this.selectedWhiteList.terms = this.oldTerms;
        return;
    }
}
