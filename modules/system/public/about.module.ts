import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from 'system/public/components/about/about.component';

const appRoutes: Routes = [{ path: '', component: AboutComponent }];

@NgModule({
    imports: [CommonModule, RouterModule.forChild(appRoutes)],
    declarations: [AboutComponent],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AboutModule {}
