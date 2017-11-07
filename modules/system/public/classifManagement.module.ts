import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { WidgetModule } from 'widget/widget.module';

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { OrgClassificationManagementComponent } from 'system/public/components/siteAdmin/orgClassificationManagement/orgClassificationManagement.component';
import { TreeModule } from 'angular-tree-component';


const appRoutes: Routes = [
    {path: '', component: OrgClassificationManagementComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(appRoutes),
        TreeModule,
        // core
        WidgetModule,
        // internal
        AdminItemModule,
    ],
    declarations: [
        OrgClassificationManagementComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClassifManagementModule {
}
