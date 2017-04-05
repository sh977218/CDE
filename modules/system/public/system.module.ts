import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { PaginationModule, ModalModule, TypeaheadModule } from "ng2-bootstrap/index";
import { DataTableModule } from "angular2-datatable";
import { Select2Module } from "ng2-select2";

import {
    InlineEditDirective, CdeAccordionListDirective, FormAccordionListDirective,
    FormSummaryListDirective
} from "./upgrade-components";
import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { ProfileComponent } from "./components/profile.component";
import { UserCommentsComponent } from "./userComments.component";
import { IdentifiersComponent } from "./components/adminItem/identifiers.component";
import { LogAuditComponent } from "./components/siteAdmin/logAudit/logAudit.component";
import { UsersMgtComponent } from "./components/siteAdmin/usersMgt/usersMgt.component";
import { LinkedFormsComponent } from "./components/linkedForms.component";
import { RegistrationComponent } from "./components/adminItem/registration.component";
import { HomeComponent } from "./components/home/home.component";


@NgModule({
    declarations: [
        InlineEditDirective,
        CdeAccordionListDirective,
        FormAccordionListDirective,
        FormSummaryListDirective,
        ProfileComponent,
        LinkedFormsComponent,
        IdentifiersComponent,
        UserCommentsComponent,
        HomeComponent,
        LogAuditComponent,
        RegistrationComponent,
        UsersMgtComponent,
        PlaceHoldEmptyPipe
    ],
    entryComponents: [
        ProfileComponent,
        LinkedFormsComponent,
        IdentifiersComponent,
        HomeComponent,
        LogAuditComponent,
        RegistrationComponent,
        UsersMgtComponent,
    ],
    providers: [],
    imports: [CommonModule, FormsModule, ModalModule.forRoot(), TypeaheadModule.forRoot(),
        PaginationModule.forRoot(), DataTableModule, Select2Module, NgbModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SystemModule {
}
