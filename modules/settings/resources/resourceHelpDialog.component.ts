import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'cde-resources-help',
    templateUrl: 'resourceHelpDialog.component.html'
})
export class ResourcesHelpDialogComponent {

    constructor(public dialogRef: MatDialogRef<ResourcesHelpDialogComponent>) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
