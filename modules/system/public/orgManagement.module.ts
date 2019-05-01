import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconModule, MatTabsModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NonCoreModule } from 'non-core/noncore.module';
import { DraftsListModule } from 'draftsList/draftsList.module';
import { DataService } from 'shared/models.model';
import { EmbedComponent } from 'system/public/components/embed/embed.component';
import { OrgDataService } from 'system/public/components/orgManagement/orgData.service';
import { OrgAccountManagementComponent } from 'system/public/components/siteAdmin/orgAccountManagement/orgAccountManagement.component';
import { SystemModule } from 'system/public/system.module';
import { UsernameAutocompleteModule } from 'usernameAutocomplete/usernameAutocomplete.module';

const appRoutes: Routes = [
    {path: '', component: OrgAccountManagementComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTabsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        // non-core
        NonCoreModule,
        // internal
        DraftsListModule,
        SystemModule,
        UsernameAutocompleteModule,
    ],
    declarations: [
        EmbedComponent,
        OrgAccountManagementComponent,
    ],
    entryComponents: [],
    exports: [],
    providers: [
        {provide: DataService, useClass: OrgDataService},
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrgManagementModule {
}
