import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DatePipe, JsonPipe } from '@angular/common';
import * as StackTraceParser from 'stacktrace-parser';

@Component({
    templateUrl: './client-error-detail-modal.component.html',
    imports: [MatDialogModule, DatePipe, JsonPipe],
    standalone: true,
})
export class ClientErrorDetailModalComponent {
    stack;

    constructor(@Inject(MAT_DIALOG_DATA) data: string) {
        this.stack = StackTraceParser.parse(data);
    }
}
