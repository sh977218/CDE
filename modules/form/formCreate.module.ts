import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminItemModule } from 'adminItem/adminItem.module';
import { CreateFormComponent } from 'adminItem/createForm/createForm.component';

import { loggedInGuard } from '_app/routerGuard/loggedInGuard';

const appRoutes: Routes = [{ path: '', component: CreateFormComponent, canActivate: [loggedInGuard] }];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
        // non-core

        // internal
        AdminItemModule,
    ],
    declarations: [],
    exports: [],
    providers: [],
    schemas: [],
})
export class FormCreateModule {}
