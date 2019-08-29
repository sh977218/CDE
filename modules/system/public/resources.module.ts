import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatCardModule, MatButtonModule, MatIconModule, MatListModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { SafeHtmlPipe } from '_app/safeHtml.pipe';
import { ResourcesComponent } from 'system/public/components/resources/resources.component';
import { ResourceResolve } from 'system/public/components/resources/resources.resolve';
import { ResourcesRssComponent } from 'system/public/components/resources/resourcesRss.component';

const appRoutes: Routes = [
    {path: '', resolve: {resource: ResourceResolve}, component: ResourcesComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),

        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
    ],
    declarations: [
        SafeHtmlPipe,
        ResourcesComponent,
        ResourcesRssComponent,
    ],
    entryComponents: [ResourcesRssComponent],
    exports: [],
    providers: [ResourceResolve],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ResourcesModule {
}
