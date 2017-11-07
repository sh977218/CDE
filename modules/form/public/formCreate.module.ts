import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { CreateFormComponent } from 'adminItem/public/components/createForm.component';
import { WidgetModule } from 'widget/widget.module';


const appRoutes: Routes = [
    {path: '', component: CreateFormComponent},
];


@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
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
