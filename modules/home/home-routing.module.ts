import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from 'home/home.component';
import { HomeEditComponent } from 'home/homeEdit.component';
import { nlmCuratorGuard } from '_app/routerGuard/nlmCuratorGuard';

const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    {
        path: 'edit',
        component: HomeEditComponent,
        canActivate: [nlmCuratorGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(appRoutes)],
    exports: [RouterModule],
})
export class HomeRoutingModule {}
