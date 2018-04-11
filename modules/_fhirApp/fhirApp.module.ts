import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { FhirAppComponent, FhirStandaloneComponent } from "./fhirApp.component";
import { NativeRenderModule } from "../nativeRender/nativeRender.module";

const appRoutes: Routes = [
    {path: 'form', component: FhirAppComponent},
];


@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        // core
        // no WidgetModule,
        NativeRenderModule,
        RouterModule.forRoot(appRoutes),
    ],
    declarations: [
        FhirAppComponent,
        FhirStandaloneComponent
    ],
    entryComponents: [
        FhirAppComponent,
    ],
    exports: [
    ],
    providers: [
    ],
    bootstrap: [FhirStandaloneComponent]
})
export class FhirAppModule {
}
