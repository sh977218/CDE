import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FormSearchComponent } from './components/search/formSearch.component';
import { FormSearchModule } from 'form/public/formSearch.module';

const appRoutes: Routes = [
    {path: '', component: FormSearchComponent},
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
        // internal
        FormSearchModule,
    ],
    declarations: [
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: []
})
export class FormSearchEntryModule {
}
