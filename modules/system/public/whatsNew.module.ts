import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WhatsNewComponent } from 'system/public/components/whatsNew/whatsNew.component';

const appRoutes: Routes = [
    {path: '', component: WhatsNewComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
    ],
    declarations: [
        WhatsNewComponent
    ],
    entryComponents: [],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WhatsNewModule {
}
