import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatPaginatorModule,
    MatTabsModule
} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CompareModule } from 'compare/compare.module';
import { DiffMatchPatchModule } from 'ng-diff-match-patch';
import { CamelCaseToHumanPipe } from 'core/camelCaseToHuman.pipe';
import { ActiveBansComponent } from 'siteAudit/activeBans/activeBans.component';
import { AppLogComponent } from 'siteAudit/appLogs/appLog.component';
import { ClassificationAuditLogComponent } from 'siteAudit/classificationAuditLog/classificationAuditLog.component';
import { ClientErrorsComponent } from 'siteAudit/clientErrors/clientErrors.component';
import { DailyUsageComponent } from 'siteAudit/dailyUsage/dailyUsage.component';
import { FeedbackIssuesComponent } from 'siteAudit/feedbackIssues/feedbackIssues.component';
import { DataElementLogComponent } from 'siteAudit/itemLog/dataElementLog.component';
import { FormLogComponent } from 'siteAudit/itemLog/formLog.component';
import { LogAuditComponent } from 'siteAudit/logAudit/logAudit.component';
import { ServerErrorsComponent } from 'siteAudit/serverErrors/serverErrors.component';
import { SiteAuditComponent } from 'siteAudit/siteAudit.component';

const appRoutes: Routes = [
    {path: '', component: SiteAuditComponent},
];

@NgModule({
    imports: [
        CommonModule,
        DiffMatchPatchModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatIconModule,
        MatPaginatorModule,
        MatTabsModule,
        // core
        // internal
        CompareModule
    ],
    declarations: [
        ActiveBansComponent,
        AppLogComponent,
        CamelCaseToHumanPipe,
        ClassificationAuditLogComponent,
        ClientErrorsComponent,
        DailyUsageComponent,
        DataElementLogComponent,
        FeedbackIssuesComponent,
        FormLogComponent,
        LogAuditComponent,
        ServerErrorsComponent,
        SiteAuditComponent,
    ],
    entryComponents: [],
    exports: [],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SiteAuditModule {
}
