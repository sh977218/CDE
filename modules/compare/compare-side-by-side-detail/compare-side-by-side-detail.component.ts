import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JsonPipe } from '@angular/common';
import { NgxTextDiffModule } from '@winarg/ngx-text-diff';

@Component({
    templateUrl: './compare-side-by-side-detail.component.html',
    imports: [JsonPipe, NgxTextDiffModule],
    standalone: true,
})
export class CompareSideBySideDetailComponent {
    data = inject(MAT_DIALOG_DATA);
    left = JSON.stringify(this.data.left);
    right = JSON.stringify(this.data.right);
}
