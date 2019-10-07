import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule, MatIconModule, MatListModule } from '@angular/material';
import { RouterModule, Routes } from '@angular/router';
import { ResourcesComponent } from 'system/public/components/resources/resources.component';
import { ResourceResolve } from 'system/public/components/resources/resources.resolve';
import { ResourcesRssComponent } from 'system/public/components/resources/resourcesRss.component';
import { SafeHtmlPipe } from '_app/safeHtml.pipe';

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
        ResourcesComponent,
        ResourcesRssComponent,
        SafeHtmlPipe,
    ],
    entryComponents: [ResourcesRssComponent],
    exports: [
        SafeHtmlPipe
    ],
    providers: [ResourceResolve, SafeHtmlPipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ResourcesModule {
}
