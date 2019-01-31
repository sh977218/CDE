import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { CdeStatusReportComponent } from 'cde/public/components/statusReport/cdeStatusReport.component';
import { MatIconModule } from '@angular/material';
import { CoreModule } from 'core/core.module';

const appRoutes: Routes = [
    {path: '', component: CdeStatusReportComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
        // core
        CoreModule,

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
