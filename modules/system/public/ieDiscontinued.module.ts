import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IeDiscontinuedComponent } from 'system/public/components/ieDiscontinued.component';

const appRoutes: Routes = [
    {path: '', component: IeDiscontinuedComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(appRoutes),
        // non-core

        // internal
    ],
    declarations: [
        IeDiscontinuedComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IeDiscontinuedModule {
}
