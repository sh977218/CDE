import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { InboxComponent } from 'system/public/components/inbox/inbox.component';

import { MatButtonModule, MatDialogModule, MatExpansionModule } from '@angular/material';


const appRoutes: Routes = [
    {path: '', component: InboxComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        MatDialogModule,
        MatButtonModule,
        MatExpansionModule,

        // internal
    ],
    declarations: [
        InboxComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InboxModule {
}
