import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

import { SearchPreferencesComponent } from "./components/searchPreferences/searchPreferences.component";

import { MatButtonModule, MatIconModule } from '@angular/material';

const appRoutes: Routes = [
    {path: '', component: SearchPreferencesComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(appRoutes),

        MatButtonModule,
        MatIconModule,
    ],
    declarations: [
        SearchPreferencesComponent,
    ],
    entryComponents: [],
    exports: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SearchPreferencesModule {
}
