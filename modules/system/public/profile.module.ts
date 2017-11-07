import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { CdeSearchModule } from 'cde/public/cdeSearch.module';
import { FormSearchModule } from 'form/public/formSearch.module';
import { ProfileComponent } from "./components/profile.component";
import { SearchModule } from 'search/search.module';
import { UserCommentsComponent } from "./components/userComments.component";
import { WidgetModule } from 'widget/widget.module';


const appRoutes: Routes = [
    {path: '', component: ProfileComponent},
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
        // internal
        CdeSearchModule,
        FormSearchModule,
        SearchModule,
    ],
    declarations: [
        ProfileComponent,
        UserCommentsComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfileModule {
}
