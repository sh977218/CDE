import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FormSearchComponent } from 'form/search/formSearch.component';
import { FormSearchModule } from 'form/formSearch.module';

const appRoutes: Routes = [{ path: '', component: FormSearchComponent }];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
        // internal
        FormSearchModule,
    ],
    declarations: [],
    exports: [],
    providers: [],
    schemas: [],
})
export class FormSearchEntryModule {}
