import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CdeSearchComponent } from 'cde/public/components/search/cdeSearch.component';
import { CdeSearchModule } from 'cde/public/cdeSearch.module';

const appRoutes: Routes = [
    {path: '', component: CdeSearchComponent},
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
        // internal
        CdeSearchModule
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
