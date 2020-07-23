import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from 'system/public/components/login/login.component';
import { MatButtonModule } from '@angular/material/button';
import { FederatedLoginComponent } from 'system/public/components/federatedLogin/federatedLogin.component';

const appRoutes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'federated', component: FederatedLoginComponent}
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
        FederatedLoginComponent,
    ],
    entryComponents: [
    ],
    exports: [
    ],
    providers: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginModule {
}
