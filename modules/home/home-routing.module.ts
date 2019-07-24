import { NgModule } from '@angular/core';

import { HomeComponent } from 'home/home.component';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
    {path: '', component: HomeComponent},
];


@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
    ],
    exports: [
        RouterModule,
    ],
})
export class HomeRoutingModule {
}
