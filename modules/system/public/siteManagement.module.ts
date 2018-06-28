import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CKEditorModule } from 'ng2-ckeditor';

import { CommonAppModule } from '_commonApp/commonApp.module';
import { DiscussModule } from 'discuss/discuss.module';
import { SystemModule } from 'system/public/system.module';
import { FhirAppsComponent } from 'system/public/components/siteAdmin/fhirApps/fhirApps.component';
import { DraftsListAdminComponent } from 'system/public/components/draftsList/draftsListAdmin.component';
import { EditSiteAdminsComponent } from 'system/public/components/siteAdmin/editSiteAdmins/editSiteAdmins.component';
import { ServerStatusComponent } from 'system/public/components/siteAdmin/serverStatus/serverStatus.component';
import { SiteManagementComponent } from 'system/public/components/siteAdmin/siteManagement/siteManagement.component';
import { WidgetModule } from 'widget/widget.module';


const appRoutes: Routes = [
    {path: '', component: SiteManagementComponent},
];

@NgModule({
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        MatIconModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
        // internal
        CommonAppModule,
        DiscussModule,
        SystemModule,
    ],
    declarations: [
        EditSiteAdminsComponent,
        FhirAppsComponent,
        DraftsListAdminComponent,
        ServerStatusComponent,
        SiteManagementComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SiteManagementModule {
}
