import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { FhirAppComponent, ViewFhirObservationDialogComponent } from "./fhirApp.component";
import { NativeRenderModule } from "../nativeRender/nativeRender.module";

import {
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
} from '@angular/material';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        NativeRenderModule,
        MatIconModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatDialogModule,
        MatSnackBarModule,
    ],
    declarations: [
        FhirAppComponent,
        ViewFhirObservationDialogComponent,
    ],
    entryComponents: [
        FhirAppComponent,
        ViewFhirObservationDialogComponent,
    ],
    bootstrap: [FhirAppComponent]
})
export class FhirAppModule {
}
