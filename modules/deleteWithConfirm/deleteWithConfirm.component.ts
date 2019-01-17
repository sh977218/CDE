import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'cde-delete-with-confirm',
    template: `
        <mat-icon *ngIf="!confirmDelete; else askConfirmDelete" title="Remove Item"
           (click)="confirmDelete = true">delete_outline</mat-icon>
        <ng-template #askConfirmDelete>
            <span class="badge badge-secondary" style="font-size: 75%">Confirm Delete
                <a class="badge badge-danger" (click)="deleted.emit()"
                   title="Delete">Delete <mat-icon style="font-size: 14px; height: 14px">check</mat-icon></a>
                <a class="badge badge-secondary" (click)="confirmDelete = false"
                   id="cancelRemoveProperty-{{i}}" title="Cancel">Cancel <mat-icon style="font-size: 14px; height: 14px">cancel</mat-icon></a>
            </span>
        </ng-template>
    `
})
export class DeleteWithConfirmComponent {
    @Output() deleted = new EventEmitter<void>();
    confirmDelete = false;
}