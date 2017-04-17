import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { DataTableModule } from "angular2-datatable";
import { Select2Module } from "ng2-select2";

import { CdeAccordionListDirective, FormAccordionListDirective, FormSummaryListDirective } from "./upgrade-components";
import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { ProfileComponent } from "./components/profile.component";
import { LinkedFormsComponent } from "./components/linkedForms.component";
import { UserCommentsComponent } from "./components/userComments.component";
import { RegistrationComponent } from "./components/adminItem/registration.component";
import { HomeComponent } from "./components/home/home.component";
import { LogAuditComponent } from "./components/siteAdmin/logAudit/logAudit.component";
import { UsersMgtComponent } from "./components/siteAdmin/usersMgt/usersMgt.component";
import { AdminItemModule } from "../../adminItem/public/adminItem.module";
import { DailyUsageComponent } from "./components/siteAdmin/dailyUsage/dailyUsage.component";
import { JsonpModule } from "@angular/http";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DataTableModule,
        Select2Module,
        NgbModule,
        JsonpModule,
        AdminItemModule
    ],
    declarations: [
        CdeAccordionListDirective,
        FormAccordionListDirective,
        FormSummaryListDirective,
        ProfileComponent,
        LinkedFormsComponent,
        UserCommentsComponent,
        HomeComponent,
        LogAuditComponent,
        RegistrationComponent,
        UsersMgtComponent,
        DailyUsageComponent,
        PlaceHoldEmptyPipe
    ],
    entryComponents: [
        ProfileComponent,
        LinkedFormsComponent,
        HomeComponent,
        LogAuditComponent,
        RegistrationComponent,
        UsersMgtComponent,
        DailyUsageComponent
    ],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SystemModule {
}
