import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WidgetModule } from 'widget/widget.module';

import { EmbedComponent } from 'system/public/components/embed/embed.component';
import { OrgAccountManagementComponent } from 'system/public/components/siteAdmin/orgAccountManagement/orgAccountManagement.component';
import { SystemModule } from 'system/public/system.module';

const appRoutes: Routes = [
    {path: '', component: OrgAccountManagementComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
        // internal
        SystemModule,
    ],
    declarations: [
        EmbedComponent,
        OrgAccountManagementComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrgManagementModule {
}
