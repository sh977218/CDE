import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { NgSelectModule } from '@ng-select/ng-select';

import { SearchPreferencesComponent } from "./components/searchPreferences/searchPreferences.component";
import { WidgetModule } from 'widget/widget.module';
import { MatButtonModule, MatIconModule } from '@angular/material';

const appRoutes: Routes = [
    {path: '', component: SearchPreferencesComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgSelectModule,
        RouterModule.forChild(appRoutes),
        WidgetModule,
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
