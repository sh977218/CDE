import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RecaptchaModule } from 'ng-recaptcha';


import { LoginComponent } from "./components/login/login.component";
import { RouterModule, Routes } from "@angular/router";
import { MatButtonModule } from '@angular/material';

const appRoutes: Routes = [
    {path: '', component: LoginComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        RecaptchaModule.forRoot(),
        RouterModule.forChild(appRoutes),
        // core

        // internal
    ],
    declarations: [
        LoginComponent,
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
