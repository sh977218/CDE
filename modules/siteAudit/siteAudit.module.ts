import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { CompareModule } from 'compare/compare.module';
import { NgxTextDiffModule } from 'ngx-text-diff';
import { CamelCaseToHumanPipe } from 'non-core/camelCaseToHuman.pipe';
import { ActiveBansComponent } from 'siteAudit/activeBans/activeBans.component';
import { AppLogComponent } from 'siteAudit/appLogs/appLog.component';
import { ClassificationAuditLogComponent } from 'siteAudit/classificationAuditLog/classificationAuditLog.component';
import { ClientErrorsComponent } from 'siteAudit/clientErrors/clientErrors.component';
import { DailyUsageComponent } from 'siteAudit/dailyUsage/dailyUsage.component';
import { DataElementLogComponent } from 'siteAudit/itemLog/dataElementLog.component';
import { FormLogComponent } from 'siteAudit/itemLog/formLog.component';
import { LogAuditComponent } from 'siteAudit/logAudit/logAudit.component';
import { ServerErrorsComponent } from 'siteAudit/serverErrors/serverErrors.component';
import { SiteAuditComponent } from 'siteAudit/siteAudit.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { ClientErrorDetailModalComponent } from 'siteAudit/clientErrors/client-error-detail-modal/client-error-detail-modal.component';
import { MatDialogModule } from '@angular/material/dialog';

const appRoutes: Routes = [{ path: '', component: SiteAuditComponent }];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,

        RouterModule.forChild(appRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatIconModule,
        MatPaginatorModule,
        MatTabsModule,
        NgxTextDiffModule,
        // non-core
        // internal
        CompareModule,
        MatDialogModule,
    ],
    declarations: [
        ActiveBansComponent,
        AppLogComponent,
        CamelCaseToHumanPipe,
        ClassificationAuditLogComponent,
        ClientErrorsComponent,
        ClientErrorDetailModalComponent,
        DailyUsageComponent,
        DataElementLogComponent,
        FormLogComponent,
        LogAuditComponent,
        ServerErrorsComponent,
        SiteAuditComponent,
    ],
    exports: [RouterModule],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SiteAuditModule {}
