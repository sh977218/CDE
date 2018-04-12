import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { FhirAppComponent } from "./fhirApp.component";
import { NativeRenderModule } from "../nativeRender/nativeRender.module";

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        NativeRenderModule,
    ],
    declarations: [
        FhirAppComponent,
    ],
    entryComponents: [
        FhirAppComponent,
    ],
    bootstrap: [FhirAppComponent]
})
export class FhirAppModule {
}
