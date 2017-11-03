import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { CdeModule } from 'cde/public/cde.module';
import { CreateDataElementComponent } from 'cde/public/components/createDataElement.component';
import { SearchModule } from 'search/search.module';
import { WidgetModule } from 'widget/widget.module';


const appRoutes: Routes = [
    {path: '', component: CreateDataElementComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
        // internal
        AdminItemModule,
        CdeModule,
    ],
    declarations: [
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CdeCreateModule {
}
