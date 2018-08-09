import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RecaptchaModule } from 'ng-recaptcha';
import { WidgetModule } from 'widget/widget.module';

import { LoginComponent } from "./components/login/login.component";
import { RouterModule, Routes } from "@angular/router";


const appRoutes: Routes = [
    {path: '', component: LoginComponent},
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        RecaptchaModule.forRoot(),
        RouterModule.forChild(appRoutes),
        // core
        WidgetModule,
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
