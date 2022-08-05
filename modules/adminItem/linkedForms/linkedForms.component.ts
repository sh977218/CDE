import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LinkedFormModalComponent } from 'adminItem/linkedForms/linked-form-modal/linked-form-modal.component';
import { Elt } from 'shared/models.model';

@Component({
    selector: 'cde-linked-forms',
    templateUrl: './linkedForms.component.html'
})

export class LinkedFormsComponent {
    @Input() elt!: Elt;

    constructor(public dialog: MatDialog) {
    }


    openLinkedFormsModal() {
        const data = this.elt;
        this.dialog.open(LinkedFormModalComponent, {width: '800px', data});
    }
}
