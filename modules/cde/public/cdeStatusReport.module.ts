import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { CdeStatusReportComponent } from 'cde/public/components/statusReport/cdeStatusReport.component';
import { NonCoreModule } from 'non-core/noncore.module';
import { MatIconModule } from '@angular/material/icon';

const appRoutes: Routes = [
    {path: '', component: CdeStatusReportComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
        // non-core
        NonCoreModule,

        // internal
        MatIconModule,
    ],
    declarations: [CdeStatusReportComponent],
    entryComponents: [],
    exports: [],
    providers: [],
    schemas: []
})
export class CdeStatusReportModule {
}
