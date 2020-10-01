import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClassifyItemDialogComponent } from 'adminItem/classification/classifyItemDialog.component';
import { ClassificationClassified } from 'shared/models.model';

export interface ClassifyItemDialogData {
    title: string;
}

@Component({
    selector: 'cde-classify-item',
    template: ``,
})
export class ClassifyItemComponent {
    @Input() modalTitle = 'Classify this CDE';
    @Output() classified = new EventEmitter<ClassificationClassified>();

    constructor(public dialog: MatDialog) {
    }

    openModal(title?: string) {
        this.dialog.open<ClassifyItemDialogComponent, ClassifyItemDialogData, ClassificationClassified>(
            ClassifyItemDialogComponent,
            {
                width: '800px',
                data: {
                    title: title || this.modalTitle,
                }
            }
        ).afterClosed().subscribe(classifier => {
            if (classifier) {
                this.classified.emit(classifier);
            }
        });
    }
}
