import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { TreeModule } from 'angular-tree-component';
import "angular-tree-component/dist/angular-tree-component.css";

import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { OrgClassificationManagementComponent } from 'system/public/components/siteAdmin/orgClassificationManagement/orgClassificationManagement.component';

import { MatButtonModule, MatDialogModule, MatIconModule, MatInputModule, MatSelectModule } from '@angular/material';

const appRoutes: Routes = [
    {path: '', component: OrgClassificationManagementComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(appRoutes),
        TreeModule.forRoot(),
        // core

        // internal
        AdminItemModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
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
