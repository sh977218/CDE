import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';

@Component({
    templateUrl: './pinBoardSnackbar.component.html',
})
export class PinBoardSnackbarComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any, public snackBar: MatSnackBar) {}
}
