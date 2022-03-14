import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NlmCuratorGuard } from '_app/routerGuard/nlmCuratorGuard';
import { HomeComponent } from 'home/home.component';
import { HomeEditComponent } from 'home/homeEdit.component';

const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'edit', component: HomeEditComponent, canActivate: [NlmCuratorGuard]},
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
