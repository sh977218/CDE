import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'cde-article-help',
    templateUrl: 'articleHelpDialog.component.html'
})
export class ArticleHelpDialogComponent {

    constructor(public dialogRef: MatDialogRef<ArticleHelpDialogComponent>) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }
}
