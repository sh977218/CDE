import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule, Routes } from '@angular/router';
import { TocModule } from 'angular-aio-toc/toc.module';
import { GuideComponent } from 'system/public/components/guide/guide.component';

const appRoutes: Routes = [
    {path: '', component: GuideComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
        MatSidenavModule,
        MatIconModule,
        TocModule,
        RouterModule,
        MatButtonModule
    ],
    declarations: [
        GuideComponent
    ],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GuideModule {
}
