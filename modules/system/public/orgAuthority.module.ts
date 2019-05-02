import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ListManagementComponent } from 'system/public/components/siteAdmin/listManagement/listManagement.component';
import { StatusValidationRulesComponent } from 'system/public/components/siteAdmin/statusValidationRules/statusValidationRules.component';
import { OrgAuthorityComponent } from 'system/public/components/siteAdmin/orgAuthority/orgAuthority.component';
import { OrgsEditComponent } from 'system/public/components/siteAdmin/orgsEdit/orgsEdit.component';
import { DiscussModule } from 'discuss/discuss.module';
import { SystemModule } from 'system/public/system.module';

import {
    MatAutocompleteModule, MatButtonModule,
    MatChipsModule, MatDialogModule,
    MatIconModule, MatInputModule, MatTabsModule
} from '@angular/material';
import { OneListMgtComponent } from 'system/public/components/siteAdmin/listManagement/oneListMgt.component';
import { NonCoreModule } from 'non-core/noncore.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { InlineEditModule } from 'inlineEdit/inlineEdit.module';
import { InlineSelectEditModule } from 'inlineSelectEdit/inlineSelectEdit.module';

const appRoutes: Routes = [
    {path: '', component: OrgAuthorityComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        // non-core
        NonCoreModule,

        // internal
        InlineAreaEditModule,
        InlineEditModule,
        DiscussModule,
        SystemModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatChipsModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        MatTabsModule,
        ReactiveFormsModule,
    ],
    declarations: [
        ListManagementComponent,
        OneListMgtComponent,
        OrgAuthorityComponent,
        OrgsEditComponent,
        StatusValidationRulesComponent,
    ],
    entryComponents: [],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrgAuthorityModule {
}
