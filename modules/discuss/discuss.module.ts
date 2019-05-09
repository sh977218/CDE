import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatDialogModule, MatPaginatorModule, MatButtonModule } from '@angular/material';
import { DiscussAreaComponent } from 'discuss/components/discussArea/discussArea.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatPaginatorModule,
        // non-core

        // internal
    ],
    declarations: [
        DiscussAreaComponent,
    ],
    entryComponents: [
        DiscussAreaComponent,
    ],
    exports: [
        DiscussAreaComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DiscussModule {
}
