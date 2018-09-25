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
import { WidgetModule } from 'widget/widget.module';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule
} from '@angular/material';

const appRoutes: Routes = [
    {path: '', component: OrgAuthorityComponent},
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
        DiscussModule,
        SystemModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatChipsModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    declarations: [
        ListManagementComponent,
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
