import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { CreateFormComponent } from 'adminItem/public/components/createForm/createForm.component';

import { LoggedInGuard } from '_app/routerGuard/loggedInGuard';

const appRoutes: Routes = [
    {path: '', component: CreateFormComponent, canLoad: [LoggedInGuard]},
];


@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
        // non-core

        // internal
        AdminItemModule,
    ],
    declarations: [
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: []
})
export class FormCreateModule {
}
