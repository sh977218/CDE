import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { CdeModule } from 'cde/public/cde.module';
import { CreateDataElementComponent } from 'cde/public/components/createDataElement/createDataElement.component';

import { LoggedInGuard } from '_app/routerGuard/loggedInGuard';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeCreateModule {
}
