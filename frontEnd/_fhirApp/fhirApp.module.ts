import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule, MatSelectModule,
    MatSnackBarModule,
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { CdeFhirService, SelectOneDialogComponent } from './cdeFhir.service';
import { FhirAppComponent, FhirStandaloneComponent, ViewFhirEncounterDialogComponent } from './fhirApp.component';
import { FhirSmartService } from './fhirSmart.service';
import { FhirBrowserEncounterComponent } from './browser/fhirBrowserEncounter.component';
import { NativeRenderModule } from 'nativeRender/nativeRender.module';

const appRoutes: Routes = [
    {path: 'form/:config', component: FhirAppComponent},
];

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
        MatSelectModule,
        MatSnackBarModule,
        RouterModule.forRoot(appRoutes),
    ],
    declarations: [
        FhirAppComponent,
        FhirBrowserEncounterComponent,
        FhirStandaloneComponent,
        SelectOneDialogComponent,
        ViewFhirEncounterDialogComponent,
    ],
    entryComponents: [
        FhirAppComponent,
        SelectOneDialogComponent,
        ViewFhirEncounterDialogComponent,
    ],
    providers: [
        CdeFhirService,
        FhirSmartService,
    ],
    bootstrap: [FhirStandaloneComponent]
})
export class FhirAppModule {
}
