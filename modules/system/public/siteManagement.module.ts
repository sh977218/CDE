import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { JsonpModule } from "@angular/http";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { CKEditorModule } from 'ng2-ckeditor';
import { WidgetModule } from 'widget/widget.module';

import { EditSiteAdminsComponent } from "./components/siteAdmin/editSiteAdmins/editSiteAdmins.component";
import { ServerStatusComponent } from "./components/siteAdmin/serverStatus/serverStatus.component";
import { TimeAgoPipe } from "time-ago-pipe";
import { SiteManagementComponent } from "./components/siteAdmin/siteManagement/siteManagement.component";
import { DiscussModule } from 'discuss/discuss.module';
import { RouterModule, Routes } from "@angular/router";
import { SystemModule } from 'system/public/system.module';

const appRoutes: Routes = [
    {path: '', component: SiteManagementComponent},
];

@NgModule({
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        JsonpModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
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
        TimeAgoPipe,
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
