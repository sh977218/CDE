import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PaginationModule } from "ng2-bootstrap";
import { DataTableModule } from "angular2-datatable";
import { ModalModule } from "ng2-bootstrap";

import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { ProfileComponent } from "./components/profile.component";
import { upgradeAdapter } from "../../upgrade";
import { UserCommentsComponent } from "./userComments.component";
import { IdentifiersComponent } from "./components/adminItem/identifiers.component";
import { LogAuditComponent } from "./components/siteAdmin/logAudit/logAudit.component";
import { LinkedFormsComponent } from "./components/linkedForms.component";
import { RegistrationComponent } from "./components/adminItem/registration.component";

@NgModule({
    declarations: [
        upgradeAdapter.upgradeNg1Component("inlineEdit"),
        upgradeAdapter.upgradeNg1Component("cdeAccordionList"),
        upgradeAdapter.upgradeNg1Component("formAccordionList"),
        upgradeAdapter.upgradeNg1Component("formSummaryList"),
        ProfileComponent,
        LinkedFormsComponent,
        IdentifiersComponent,
        UserCommentsComponent,
        LogAuditComponent,
        RegistrationComponent,
        PlaceHoldEmptyPipe],
    providers: [],
    imports: [CommonModule, FormsModule, ModalModule.forRoot(), PaginationModule.forRoot(), DataTableModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SystemModule {
}
