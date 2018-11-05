import { CommonModule } from "@angular/common";
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MatGridListModule } from '@angular/material';

import { ResourcesComponent } from 'resources/resources.component';


const qbRoutes: Routes = [
    {path: '', component: ResourcesComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(qbRoutes),
        MatGridListModule
    ],
    declarations: [ResourcesComponent],
    entryComponents: [ResourcesComponent],
    exports: [],
    providers: [],
})
export class ResourcesModule {
}