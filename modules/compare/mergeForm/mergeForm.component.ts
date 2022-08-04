import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CompareForm } from 'compare/compareSideBySide/compare-form';
import { MergeFormModalComponent } from 'compare/mergeForm/merge-form-modal/merge-form-modal.component';

@Component({
    selector: 'cde-merge-form',
    templateUrl: './mergeForm.component.html'
})
export class MergeFormComponent {
    @Input() source!: CompareForm;
    @Input() destination!: CompareForm;
    @Output() doneMergeForm = new EventEmitter<{ left: CompareForm, right: CompareForm }>();

    constructor(public dialog: MatDialog) {
    }


    openMergeFormModal() {
        const data = {
            source: this.source,
            destination: this.destination
        }
        const diaRef = this.dialog.open(MergeFormModalComponent, {width: '1000px', data});

        const sub = diaRef.componentInstance.doneMerge
            .subscribe(result => this.doneMergeForm.emit(result))
        diaRef.afterClosed().subscribe(res => sub.unsubscribe());
    }
}
