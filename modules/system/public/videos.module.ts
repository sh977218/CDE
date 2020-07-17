import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VideosComponent } from 'system/public/components/videos/videos.component';
import { VideosResolve } from 'system/public/components/videos/videos.resolve';
import { NonCoreModule } from 'non-core/noncore.module';

const appRoutes: Routes = [
    {path: '', resolve: {videos: VideosResolve}, component: VideosComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
        NonCoreModule
    ],
    declarations: [
        VideosComponent
    ],
    exports: [],
    providers: [VideosResolve],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VideosModule {
}
