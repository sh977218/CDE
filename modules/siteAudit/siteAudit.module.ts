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
import { NgxTextDiffModule } from '@winarg/ngx-text-diff';
import { SiteAuditComponent } from 'siteAudit/siteAudit.component';

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
        SiteAuditComponent,
    ],
    declarations: [],
    exports: [RouterModule],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SiteAuditModule {}
