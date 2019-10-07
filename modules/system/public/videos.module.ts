import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideosComponent } from 'system/public/components/videos/videos.component';
import { SafeHtmlPipe } from '_app/safeHtml.pipe';

const appRoutes: Routes = [
    {path: '', component: VideosComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
    ],
    declarations: [
        SafeHtmlPipe,
        VideosComponent
    ],
    entryComponents: [],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VideosModule {
}
