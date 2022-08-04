import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DataElement } from 'shared/de/dataElement.model';
import {
    MergeDataElementModalComponent
} from 'compare/mergeDataElement/merge-data-element-modal/merge-data-element-modal.component';

@Component({
    selector: 'cde-merge-data-element',
    templateUrl: './mergeDataElement.component.html'
})
export class MergeDataElementComponent {
    @Input() source!: DataElement;
    @Input() destination!: DataElement;
    @Output() doneMergeDataElement = new EventEmitter<{ left: DataElement, right: DataElement }>();

    constructor(public dialog: MatDialog) {
    }

    openMergeDataElementModal() {
        const data = {
            source: this.source,
            destination: this.destination
        }
        const diaRef = this.dialog.open(MergeDataElementModalComponent, {width: '1000px', data});
        const sub = diaRef.componentInstance.doneMerge
            .subscribe(result => this.doneMergeDataElement.emit(result))
        diaRef.afterClosed().subscribe(res => sub.unsubscribe());
    }
}
