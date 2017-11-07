import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SdcViewComponent } from 'cde/public/components/sdcView/sdcView.component';
import { WidgetModule } from 'widget/widget.module';

const appRoutes: Routes = [
    {path: '', component: SdcViewComponent},
];

@NgModule({
    imports: [
        CommonModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
        // internal
    ],
    declarations: [
        SdcViewComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: []
})
export class SdcViewModule {
}
