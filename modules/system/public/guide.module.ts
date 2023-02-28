import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NonCoreModule } from 'non-core/noncore.module';
import { RouterModule, Routes } from '@angular/router';
import { TocModule } from 'angular-aio-toc/toc.module';
import { GuideComponent } from 'system/public/components/guide/guide.component';

const appRoutes: Routes = [{ path: '', component: GuideComponent }];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        NonCoreModule,
        TocModule,
        RouterModule,
    ],
    declarations: [GuideComponent],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GuideModule {}
