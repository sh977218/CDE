import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { Select2Module } from "ng2-select2";

import { SearchPreferencesComponent } from "./components/searchPreferences/searchPreferences.component";
import { WidgetModule } from 'widget/widget.module';


const appRoutes: Routes = [
    {path: '', component: SearchPreferencesComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        Select2Module,
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
        // internal
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
