import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideosComponent } from 'system/public/components/videos/videos.component';
import { SafeHtmlPipe } from '_app/safeHtml.pipe';
import { VideosResolve } from 'system/public/components/videos/videos.resolve';
import { ResourcesModule } from 'system/public/resources.module';

const appRoutes: Routes = [
    {path: '', resolve: {videos: VideosResolve}, component: VideosComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
        ResourcesModule,
    ],
    declarations: [
        SafeHtmlPipe,
        VideosComponent
    ],
    entryComponents: [],
    exports: [],
    providers: [VideosResolve, SafeHtmlPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VideosModule {
}
