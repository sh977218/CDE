import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CdeSearchComponent } from 'cde/search/cdeSearch.component';
import { CdeSearchModule } from 'cde/cdeSearch.module';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';

const appRoutes: Routes = [
    {path: '', component: CdeSearchComponent},
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
        // internal
        CdeSearchModule,
        TourMatMenuModule
    ],
    declarations: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: []
})
export class CdeSearchEntryModule {
}
