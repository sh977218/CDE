import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DatePipe, JsonPipe, NgForOf } from '@angular/common';
import * as StackTraceParser from 'stacktrace-parser';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@Component({
    templateUrl: './client-error-detail-modal.component.html',
    imports: [MatDialogModule, DatePipe, JsonPipe, NgForOf, MatListModule, MatCardModule],
    standalone: true,
})
export class ClientErrorDetailModalComponent {
    errorMessage: string;
    stacks;

    constructor(@Inject(MAT_DIALOG_DATA) public data: string) {
        this.stacks = StackTraceParser.parse(data);
        this.errorMessage = data.split('Find more at')?.at(0) || '';
    }
}
