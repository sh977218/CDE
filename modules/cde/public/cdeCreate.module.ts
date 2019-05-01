import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { CdeModule } from 'cde/public/cde.module';
import { CreateDataElementComponent } from 'cde/public/components/createDataElement.component';

import { MatButtonModule, MatIconModule } from '@angular/material';
import { LoggedInGuard } from '_app/routerGuard/loggedInGuard';

const appRoutes: Routes = [
    {path: '', component: CreateDataElementComponent, canLoad: [LoggedInGuard]},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(appRoutes),
        // non-core

        // internal
        AdminItemModule,
        CdeModule,
        MatButtonModule,
        MatIconModule
    ],
    declarations: [],
    entryComponents: [],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeCreateModule {
}
