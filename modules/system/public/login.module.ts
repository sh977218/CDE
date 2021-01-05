import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from 'system/public/components/login/login.component';

const appRoutes: Routes = [
    {
        path: '',
        component: LoginComponent,
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        RouterModule.forChild(appRoutes),
        // non-core
        // internal
    ],
    declarations: [
        LoginComponent,
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginModule {
}
