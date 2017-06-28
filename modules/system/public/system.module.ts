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
import { AlertComponent } from "./components/alert/alert.component";
import { AlertService } from "./components/alert/alert.service";
import { AppLogComponent } from "./components/siteAdmin/appLogs/appLog.component";
import { AuditLogComponent } from "./components/siteAdmin/auditLog/auditLog.component";
import { CdeDiffPopulateService } from "./components/siteAdmin/auditLog/cdeDiffPopulate.service";
import { ClassificationAuditLogComponent } from "./components/siteAdmin/classificationAuditLog/classificationAuditLog.component";

import { CamelCaseToHumanPipe } from "../../core/public/camelCaseToHumanPipe";
import { ClientErrorsComponent } from "./components/siteAdmin/clientErrors/clientErrors.component";
import { ServerErrorsComponent } from "./components/siteAdmin/serverErrors/serverErrors.component";
import { SiteAuditComponent } from "./components/siteAdmin/siteAudit/siteAudit.component";
import {FeedbackIssuesComponent} from "./components/siteAdmin/feedbackIssues/feedbackIssues.component";

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
        AlertComponent,
        AppLogComponent,
        AuditLogComponent,
        CdeAccordionListDirective,
        CamelCaseToHumanPipe,
        ClassificationAuditLogComponent,
        ClientErrorsComponent,
        DailyUsageComponent,
        FeedbackIssuesComponent,
        FormAccordionListDirective,
        HomeComponent,
        ListManagementComponent,
        LogAuditComponent,
        NavigationComponent,
        OrgAdminComponent,
        ProfileComponent,
        ServerErrorsComponent,
        SiteAuditComponent,
        TruncateLongNamePipe,
        UserCommentsComponent,
        UsersMgtComponent,
    ],
    entryComponents: [
        AlertComponent,
        HomeComponent,
        ListManagementComponent,
        NavigationComponent,
        OrgAdminComponent,
        ProfileComponent,
        SiteAuditComponent,
        UsersMgtComponent,
    ],
    exports: [],
    providers: [
        AlertService,
        CdeDiffPopulateService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SystemModule {
}
