import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { Select2Module } from "ng2-select2";

import { CdeAccordionListDirective, FormAccordionListDirective, FormSummaryListDirective } from "./upgrade-components";
import { ProfileComponent } from "./components/profile.component";
import { LinkedFormsComponent } from "./components/linkedForms.component";
import { UserCommentsComponent } from "./components/userComments.component";
import { HomeComponent } from "./components/home/home.component";
import { ListManagementComponent } from "./components/siteAdmin/listManagement/listManagement.component";
import { LogAuditComponent } from "./components/siteAdmin/logAudit/logAudit.component";
import { UsersMgtComponent } from "./components/siteAdmin/usersMgt/usersMgt.component";
import { AdminItemModule } from "../../adminItem/public/adminItem.module";
import { DailyUsageComponent } from "./components/siteAdmin/dailyUsage/dailyUsage.component";
import { OrgAdminComponent } from "./components/siteAdmin/orgAdmin/orgAdmin.component";
import { JsonpModule } from "@angular/http";
import { NavigationComponent } from "./components/navigation.component";
import { TruncateLongNamePipe } from "./truncateLongName.pipe";
import { InlineEditComponent } from "./components/inlineEdit.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Select2Module,
        NgbModule,
        JsonpModule,
        AdminItemModule
    ],
    declarations: [
        CdeAccordionListDirective,
        DailyUsageComponent,
        FormAccordionListDirective,
        FormSummaryListDirective,
        HomeComponent,
        LinkedFormsComponent,
        ListManagementComponent,
        LogAuditComponent,
        NavigationComponent,
        OrgAdminComponent,
        ProfileComponent,
        TruncateLongNamePipe,
        UserCommentsComponent,
        UsersMgtComponent,
        InlineEditComponent
    ],
    entryComponents: [
        DailyUsageComponent,
        HomeComponent,
        LinkedFormsComponent,
        ListManagementComponent,
        LinkedFormsComponent,
        LogAuditComponent,
        NavigationComponent,
        OrgAdminComponent,
        ProfileComponent,
        UsersMgtComponent
    ],
    exports: [
        LinkedFormsComponent,
        NavigationComponent,
        InlineEditComponent
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SystemModule {
}
