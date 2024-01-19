import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule, Routes } from '@angular/router';
import { CompareModule } from 'compare/compare.module';
import { NgxTextDiffModule } from 'ngx-text-diff';
import { CamelCaseToHumanPipe } from 'non-core/camelCaseToHuman.pipe';
import { ActiveBansComponent } from 'siteAudit/activeBans/activeBans.component';
import { LoginRecordComponent } from 'siteAudit/loginRecords/loginRecord.component';
import { ClassificationAuditLogComponent } from 'siteAudit/classificationAuditLog/classificationAuditLog.component';
import { DataElementLogComponent } from 'siteAudit/itemLog/dataElementLog.component';
import { FormLogComponent } from 'siteAudit/itemLog/formLog.component';
import { SiteAuditComponent } from 'siteAudit/siteAudit.component';
import { HttpLogComponent } from './http-log/http-log.component';
import { AppLogComponent } from './app-log/app-log.component';
import { DailyUsageComponent } from './daily-usage/daily-usage.component';
import { ServerErrorComponent } from './server-error/server-error.component';
import { ClientErrorComponent } from './client-error/client-error.component';

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
        HttpLogComponent,
        AppLogComponent,
        DailyUsageComponent,
        ServerErrorComponent,
        ClientErrorComponent,
    ],
    declarations: [
        ActiveBansComponent,
        CamelCaseToHumanPipe,
        ClassificationAuditLogComponent,
        DataElementLogComponent,
        FormLogComponent,
        LoginRecordComponent,
        SiteAuditComponent,
    ],
    exports: [RouterModule],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SiteAuditModule {}
