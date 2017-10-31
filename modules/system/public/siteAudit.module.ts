import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppLogComponent } from 'system/public/components/siteAdmin/appLogs/appLog.component';
import { AuditLogComponent } from 'system/public/components/siteAdmin/auditLog/auditLog.component';
import { CamelCaseToHumanPipe } from 'core/camelCaseToHumanPipe';
import { CdeDiffPopulateService } from 'system/public/components/siteAdmin/auditLog/cdeDiffPopulate.service';
import { ClassificationAuditLogComponent } from 'system/public/components/siteAdmin/classificationAuditLog/classificationAuditLog.component';
import { ClientErrorsComponent } from 'system/public/components/siteAdmin/clientErrors/clientErrors.component';
import { DailyUsageComponent } from 'system/public/components/siteAdmin/dailyUsage/dailyUsage.component';
import { FeedbackIssuesComponent } from 'system/public/components/siteAdmin/feedbackIssues/feedbackIssues.component';
import { LogAuditComponent } from 'system/public/components/siteAdmin/logAudit/logAudit.component';
import { ServerErrorsComponent } from 'system/public/components/siteAdmin/serverErrors/serverErrors.component';
import { SiteAuditComponent } from 'system/public/components/siteAdmin/siteAudit/siteAudit.component';
import { WidgetModule } from 'widget/widget.module';


const appRoutes: Routes = [
    {path: '', component: SiteAuditComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
        // internal
    ],
    declarations: [
        AppLogComponent,
        AuditLogComponent,
        CamelCaseToHumanPipe,
        ClassificationAuditLogComponent,
        ClientErrorsComponent,
        DailyUsageComponent,
        FeedbackIssuesComponent,
        LogAuditComponent,
        ServerErrorsComponent,
        SiteAuditComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
        CdeDiffPopulateService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SiteAuditModule {
}
