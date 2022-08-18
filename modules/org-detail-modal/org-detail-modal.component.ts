import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    templateUrl: './org-detail-modal.component.html',
})
export class OrgDetailModalComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public orgHtmlOverview: string) {}
}
