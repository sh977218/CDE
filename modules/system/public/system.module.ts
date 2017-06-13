import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { JsonpModule } from "@angular/http";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from "ng2-select2";
import { CKEditorModule } from 'ng2-ckeditor';
import { WidgetModule } from "../../widget/widget.module";

import { CdeAccordionListDirective, FormAccordionListDirective } from "./upgrade-components";
import { ProfileComponent } from "./components/profile.component";
import { UserCommentsComponent } from "./components/userComments.component";
import { HomeComponent } from "./components/home/home.component";
import { ListManagementComponent } from "./components/siteAdmin/listManagement/listManagement.component";
import { LogAuditComponent } from "./components/siteAdmin/logAudit/logAudit.component";
import { UsersMgtComponent } from "./components/siteAdmin/usersMgt/usersMgt.component";
import { DailyUsageComponent } from "./components/siteAdmin/dailyUsage/dailyUsage.component";
import { OrgAdminComponent } from "./components/siteAdmin/orgAdmin/orgAdmin.component";
import { NavigationComponent } from "./components/navigation.component";
import { TruncateLongNamePipe } from "./truncateLongName.pipe";
import { TextTruncateComponent } from "./components/textTruncate/textTruncate.component";

@NgModule({
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        JsonpModule,
        NgbModule,
        Select2Module,
        // internal
        WidgetModule,
    ],
    declarations: [
        CdeAccordionListDirective,
        DailyUsageComponent,
        FormAccordionListDirective,
        HomeComponent,
        ListManagementComponent,
        LogAuditComponent,
        NavigationComponent,
        OrgAdminComponent,
        ProfileComponent,
        TruncateLongNamePipe,
        UserCommentsComponent,
        UsersMgtComponent,
        TextTruncateComponent,
    ],
    entryComponents: [
        DailyUsageComponent,
        HomeComponent,
        ListManagementComponent,
        LogAuditComponent,
        NavigationComponent,
        OrgAdminComponent,
        ProfileComponent,
        UsersMgtComponent
    ],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SystemModule {
}
