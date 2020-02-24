import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { SortableArrayComponent } from 'sortableArray/sortableArray.component';


@NgModule({
    imports: [CommonModule, MatIconModule],
    declarations: [SortableArrayComponent],
    exports: [SortableArrayComponent],
    providers: [],
    schemas: []
})

export class SortableArrayModule {
}
