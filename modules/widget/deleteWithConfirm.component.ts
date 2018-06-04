import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'cde-delete-with-confirm',
    template: `
        <i *ngIf="!confirmDelete; else askConfirmDelete" class="fa fa-trash-o hand-cursor" title="Remove Item"
           (click)="confirmDelete = true"></i>
        <ng-template #askConfirmDelete>
            <span class="badge badge-secondary" style="font-size: 75%">Confirm Delete
                <a class="badge badge-danger" (click)="deleted.emit()"
                   title="Delete">Delete <i class="fa fa-check"></i></a>
                <a class="badge badge-secondary" (click)="confirmDelete = false"
                   id="cancelRemoveProperty-{{i}}" title="Cancel">Cancel <i class="fa fa-times"></i></a>
            </span>
        </ng-template>
    `
})
export class DeleteWithConfirmComponent {
    @Output() deleted = new EventEmitter<void>();
    confirmDelete = false;
}