import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { SortableArrayComponent } from 'sortableArray/sortableArray.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
    imports: [CommonModule, MatIconModule, MatButtonModule],
    declarations: [SortableArrayComponent],
    exports: [SortableArrayComponent],
    providers: [],
    schemas: [],
})
export class SortableArrayModule {}
