import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'cde-delete-with-confirm',
    templateUrl: 'deleteWithConfirm.component.html',
    styles: [
        `
            .cdeMatIcon {
                font-size: 14px;
                height: 14px;
                line-height: 14px;
            }
        `,
    ],
})
export class DeleteWithConfirmComponent {
    @Output() deleted = new EventEmitter<void>();
    confirmDelete = false;
}
