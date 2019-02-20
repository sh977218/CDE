import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule, MatProgressBarModule,
    MatSelectModule,
    MatTabsModule
} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonAppModule } from '_commonApp/commonApp.module';
import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { CoreModule } from 'core/core.module';
import { DiscussModule } from 'discuss/discuss.module';
import { DraftsListModule } from 'draftsList/draftsList.module';
import { InlineAreaEditModule } from 'inlineAreaEdit/inlineAreaEdit.module';
import { CKEditorModule } from 'ng2-ckeditor';
import { DataService } from 'shared/models.model';
import { ArticleAdminComponent } from 'siteManagement/article/articleAdmin.component';
import { EditSiteAdminsComponent } from 'siteManagement/editSiteAdmins/editSiteAdmins.component';
import { FhirAppsComponent } from 'siteManagement/fhirApps/fhirApps.component';
import { IdSourcesComponent } from 'siteManagement/idSources/idSources.component';
import { ResourcesAdminComponent } from 'siteManagement/resources/resourcesAdmin.component';
import { ServerStatusComponent } from 'siteManagement/serverStatus/serverStatus.component';
import { SiteDataService } from 'siteManagement/siteData.service';
import { SiteManagementComponent } from 'siteManagement/siteManagement.component';
import { SystemModule } from 'system/public/system.module';
import { UsernameAutocompleteModule } from 'usernameAutocomplete/usernameAutocomplete.module';

const appRoutes: Routes = [
    {path: '', component: SiteManagementComponent},
];

@NgModule({
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatDialogModule,
        MatProgressBarModule,
        MatSelectModule,
        MatTabsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        // core
        CoreModule,
        // internal
        AdminItemModule,
        DraftsListModule,
        InlineAreaEditModule,
        CommonAppModule,
        DiscussModule,
        SystemModule,
        UsernameAutocompleteModule
    ],
    declarations: [
        ArticleAdminComponent,
        EditSiteAdminsComponent,
        FhirAppsComponent,
        IdSourcesComponent,
        ResourcesAdminComponent,
        ServerStatusComponent,
        SiteManagementComponent
    ],
    entryComponents: [],
    exports: [],
    providers: [
        {provide: DataService, useClass: SiteDataService},
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SiteManagementModule {
}
