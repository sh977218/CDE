import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { MatIconModule, MatListModule } from '@angular/material';

import { ResourcesComponent } from 'system/public/components/resources/resources.component';
import { SafeHtmlPipe } from '_app/safeHtml.pipe';

const appRoutes: Routes = [
    {path: '', component: ResourcesComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
        MatIconModule,
        MatListModule,
    ],
    declarations: [
        SafeHtmlPipe,
        ResourcesComponent
    ],
    entryComponents: [],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ResourcesModule {
}
