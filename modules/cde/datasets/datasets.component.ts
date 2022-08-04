import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DatasetsContentModalComponent } from 'cde/datasets/datasets-content-modal/datasets-content-modal.component';

@Component({
    selector: 'cde-datasets',
    templateUrl: './datasets.component.html'
})

export class DatasetsComponent {
    @Input() public elt: any;

    constructor(public dialog: MatDialog) {
    }

    openDatasetsModal() {
        const data = this.elt.dataSets;
        this.dialog.open(DatasetsContentModalComponent, {width: '800px', data});
    }
}
