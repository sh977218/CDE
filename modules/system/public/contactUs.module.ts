import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactUsComponent } from 'system/public/components/contactUs/contactUs.component';

const appRoutes: Routes = [
    {path: '', component: ContactUsComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
    ],
    declarations: [
        ContactUsComponent
    ],
    entryComponents: [],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ContactUsModule {
}
