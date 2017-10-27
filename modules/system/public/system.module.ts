import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { JsonpModule } from "@angular/http";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { Select2Module } from "ng2-select2";
import { CKEditorModule } from 'ng2-ckeditor';
import { SearchModule } from 'search/search.module';
import { WidgetModule } from 'widget/widget.module';
import { RecaptchaModule } from 'ng-recaptcha';

import { SelectBoardDirective } from "./upgrade-components";
import { ProfileComponent } from "./components/profile.component";
import { UserCommentsComponent } from "./components/userComments.component";
import { ListManagementComponent } from "./components/siteAdmin/listManagement/listManagement.component";
import { LogAuditComponent } from "./components/siteAdmin/logAudit/logAudit.component";
import { UsersMgtComponent } from "./components/siteAdmin/usersMgt/usersMgt.component";
import { DailyUsageComponent } from "./components/siteAdmin/dailyUsage/dailyUsage.component";
import { OrgAdminComponent } from "./components/siteAdmin/orgAdmin/orgAdmin.component";
import { SwaggerComponent } from "./components/swagger.component";
import { AppLogComponent } from "./components/siteAdmin/appLogs/appLog.component";
import { AuditLogComponent } from "./components/siteAdmin/auditLog/auditLog.component";
import { CdeDiffPopulateService } from "./components/siteAdmin/auditLog/cdeDiffPopulate.service";
import { ClassificationAuditLogComponent } from "./components/siteAdmin/classificationAuditLog/classificationAuditLog.component";

import { CamelCaseToHumanPipe } from 'core/camelCaseToHumanPipe';
import { ClientErrorsComponent } from "./components/siteAdmin/clientErrors/clientErrors.component";
import { ServerErrorsComponent } from "./components/siteAdmin/serverErrors/serverErrors.component";
import { SiteAuditComponent } from "./components/siteAdmin/siteAudit/siteAudit.component";
import { FeedbackIssuesComponent } from "./components/siteAdmin/feedbackIssues/feedbackIssues.component";
import { StatusValidationRulesComponent } from "./components/siteAdmin/statusValidationRules/statusValidationRules.component";
import { EditSiteAdminsComponent } from "./components/siteAdmin/editSiteAdmins/editSiteAdmins.component";
import { RegistrationValidatorService } from "./components/registrationValidator.service";
import { OrgAuthorityComponent } from "./components/siteAdmin/orgAuthority/orgAuthority.component";
import { OrgsEditComponent } from "./components/siteAdmin/orgsEdit/orgEdits.component";
import { ServerStatusComponent } from "./components/siteAdmin/serverStatus/serverStatus.component";
import { TimeAgoPipe } from "time-ago-pipe";
import { SiteManagementComponent } from "./components/siteAdmin/siteManagement/siteManagement.component";
import { DiscussModule } from 'discuss/discuss.module';
import { InboxComponent } from "./components/inbox/inbox.component";
import { SearchPreferencesComponent } from "./components/searchPreferences/searchPreferences.component";
import { EmbedComponent } from "./components/embed/embed.component";
import { LoginComponent } from "./components/login/login.component";
import { LoginService } from "./components/login/login.service";
import { OrgAccountManagementComponent } from "./components/siteAdmin/orgAccountManagement/orgAccountManagement.component";
import { OrgClassificationManagementComponent } from 'system/public/components/siteAdmin/orgClassificationManagement/orgClassificationManagement.component';
import { TreeModule } from 'angular-tree-component';
import { AdminItemModule } from 'adminItem/public/adminItem.module';
import { RouterModule, Routes } from "@angular/router";
import { LatestCommentsComponent } from "discuss/components/latestComments/latestComments.component";

const appRoutes: Routes = [
    {path: 'api', component: SwaggerComponent},
    {path: 'login', component: LoginComponent},
    {path: 'siteAudit', component: SiteAuditComponent},
    {path: 'inbox', component: InboxComponent},
    {path: 'siteaccountmanagement', component: SiteManagementComponent},
    {path: 'orgaccountmanagement', component: OrgAccountManagementComponent},
    {path: 'classificationmanagement', component: OrgClassificationManagementComponent},
    {path: 'orgAuthority', component: OrgAuthorityComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'searchPreferences', component: SearchPreferencesComponent},
    {path: 'orgComments', component: LatestCommentsComponent, data: {commentsUrl: "orgComments"}},
];

@NgModule({
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        JsonpModule,
        NgbModule,
        RecaptchaModule.forRoot(),
        RouterModule.forChild(appRoutes),
        Select2Module,
        // internal
        TreeModule,
        AdminItemModule,
        SearchModule,
        WidgetModule,
        DiscussModule
    ],
    declarations: [
        AppLogComponent,
        AuditLogComponent,
        CamelCaseToHumanPipe,
        ClassificationAuditLogComponent,
        ClientErrorsComponent,
        DailyUsageComponent,
        EditSiteAdminsComponent,
        EmbedComponent,
        FeedbackIssuesComponent,
        InboxComponent,
        ListManagementComponent,
        LogAuditComponent,
        LoginComponent,
        OrgAccountManagementComponent,
        OrgAdminComponent,
        OrgAuthorityComponent,
        OrgClassificationManagementComponent,
        OrgsEditComponent,
        ProfileComponent,
        SearchPreferencesComponent,
        ServerErrorsComponent,
        ServerStatusComponent,
        SiteAuditComponent,
        SiteManagementComponent,
        StatusValidationRulesComponent,
        SwaggerComponent,
        SelectBoardDirective,
        TimeAgoPipe,
        UserCommentsComponent,
        UsersMgtComponent,
    ],
    entryComponents: [
        InboxComponent,
        LoginComponent,
        OrgAccountManagementComponent,
        OrgAuthorityComponent,
        OrgClassificationManagementComponent,
        ServerStatusComponent,
        SearchPreferencesComponent,
        SiteAuditComponent,
        SiteManagementComponent,
        StatusValidationRulesComponent,
        SwaggerComponent,
        UsersMgtComponent,
    ],
    exports: [
        RouterModule,
    ],
    providers: [
        CdeDiffPopulateService,
        LoginService,
        RegistrationValidatorService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SystemModule {
}
