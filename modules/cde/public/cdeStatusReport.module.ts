import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WidgetModule } from 'widget/widget.module';

import { CdeStatusReportComponent } from 'cde/public/components/statusReport/cdeStatusReport.component';

const appRoutes: Routes = [
    {path: '', component: CdeStatusReportComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
        // internal
    ],
    declarations: [
        CdeStatusReportComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: []
})
export class CdeStatusReportModule {
}