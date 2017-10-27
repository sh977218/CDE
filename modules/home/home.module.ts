import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { HomeComponent } from 'home/home.component';
import { RouterModule, Routes } from '@angular/router';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';

const appRoutes: Routes = [
    {path: '', redirectTo: "/home", pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
];


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgbModule,
        RouterModule.forChild(appRoutes),
        // internal
        NativeRenderModule,
    ],
    declarations: [
        HomeComponent
    ],
    entryComponents: [
    ],
    exports: [
        RouterModule,
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeModule {
}
