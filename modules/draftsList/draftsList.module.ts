import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DraftsListComponent } from 'draftsList/draftsList.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule
    ],
    declarations: [
        DraftsListComponent
    ],
    entryComponents: [],
    exports: [
        DraftsListComponent
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DraftsListModule {
}