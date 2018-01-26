import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CKEditorModule } from 'ng2-ckeditor';
import { TimeAgoPipeModule } from 'time-ago-pipe/es5';

import { EditSiteAdminsComponent } from 'system/public/components/siteAdmin/editSiteAdmins/editSiteAdmins.component';
import { ServerStatusComponent } from 'system/public/components/siteAdmin/serverStatus/serverStatus.component';
import { SiteManagementComponent } from 'system/public/components/siteAdmin/siteManagement/siteManagement.component';
import { DiscussModule } from 'discuss/discuss.module';
import { SystemModule } from 'system/public/system.module';
import { WidgetModule } from 'widget/widget.module';

const appRoutes: Routes = [
    {path: '', component: SiteManagementComponent},
];

@NgModule({
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        TimeAgoPipeModule,
        // core
        WidgetModule,
        // internal
        DiscussModule,
        SystemModule,
    ],
    declarations: [
        EditSiteAdminsComponent,
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
