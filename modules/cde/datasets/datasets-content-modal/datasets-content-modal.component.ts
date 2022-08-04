import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'cde-datasets-content-modal',
    templateUrl: './datasets-content-modal.component.html'
})

export class DatasetsContentModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public dataSets: any) {
    }
}
