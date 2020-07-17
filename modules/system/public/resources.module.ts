import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResourcesComponent } from 'system/public/components/resources/resources.component';
import { ResourceResolve } from 'system/public/components/resources/resources.resolve';
import { ResourcesRssComponent } from 'system/public/components/resources/resourcesRss.component';
import { NonCoreModule } from 'non-core/noncore.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

const appRoutes: Routes = [
    {path: '', resolve: {resource: ResourceResolve}, component: ResourcesComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
        NonCoreModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
    ],
    declarations: [
        ResourcesComponent,
        ResourcesRssComponent
    ],
    exports: [],
    providers: [ResourceResolve],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ResourcesModule {
}
