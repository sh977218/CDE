import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwaggerComponent } from 'system/public/components/swagger.component';

const appRoutes: Routes = [
    {path: '', component: SwaggerComponent},
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
    ],
    declarations: [
        SwaggerComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: []
})
export class DocumentApiModule {
}
