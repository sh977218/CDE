import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule, Routes } from '@angular/router';
import { TreeModule } from '@circlon/angular-tree-component';
import { AdminItemModule } from 'adminItem/adminItem.module';
import {
    OrgClassificationManagementComponent
} from 'classificationManagement/orgClassificationManagement/orgClassificationManagement.component';
import { MatTreeModule } from '@angular/material/tree';
import { OrgAdminGuard } from '_app/routerGuard/orgAdminGuard';
import { AddChildClassificationDialogComponent } from 'classificationManagement/add-child-classification-dialog/add-child-classification-dialog.component';
import { ClassificationDatabase } from 'classificationManagement/classification-database';
import { RemoveClassificationDialogComponent } from 'classificationManagement/remove-classification-dialog/remove-classification-dialog.component';
import { RenameClassificationDialogComponent } from 'classificationManagement/rename-classification-dialog/rename-classification-dialog.component';
import { ManagedOrgsResolve } from 'settings/managedOrgsResolve';

const appRoutes: Routes = [
    {
        path: '', component: OrgClassificationManagementComponent,
        resolve: {
            orgs: ManagedOrgsResolve
        },
        canLoad: [OrgAdminGuard],
        data: {title: 'Org Classification Management'}
    },
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(appRoutes),
        TreeModule,
        // non-core
        // internal
        AdminItemModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatMenuModule,
        MatTreeModule,
        ReactiveFormsModule
    ],
    declarations: [
        OrgClassificationManagementComponent,
        AddChildClassificationDialogComponent,
        RemoveClassificationDialogComponent,
        RenameClassificationDialogComponent,
    ],
    exports: [],
    providers: [ManagedOrgsResolve,
        ClassificationDatabase],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClassificationManagementModule {
}
