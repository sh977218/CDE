import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataElement } from 'shared/de/dataElement.model';
import { MoreLikeThisModalComponent } from 'cde/mlt/more-like-this-modal/more-like-this-modal.component';

@Component({
    selector: 'cde-mlt',
    templateUrl: './moreLikeThis.component.html'
})
export class MoreLikeThisComponent {
    @Input() elt!: DataElement;

    constructor(private router: Router,
                private dialog: MatDialog) {
    }

    openMoreLikeThisModal() {
        const data = this.elt;
        this.dialog.open(MoreLikeThisModalComponent, {width: '1000px', data});
    }
}
