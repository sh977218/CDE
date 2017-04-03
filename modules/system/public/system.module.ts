import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PaginationModule, ModalModule, TypeaheadModule } from "ng2-bootstrap/index";
import { DataTableModule } from "angular2-datatable";
import { Select2Module } from "ng2-select2";
import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { ProfileComponent } from "./components/profile.component";
import { upgradeAdapter } from "../../upgrade";
import { UserCommentsComponent } from "./userComments.component";
import { IdentifiersComponent } from "./components/adminItem/identifiers.component";
import { LogAuditComponent } from "./components/siteAdmin/logAudit/logAudit.component";
import { UsersMgtComponent } from "./components/siteAdmin/usersMgt/usersMgt.component";
import { LinkedFormsComponent } from "./components/linkedForms.component";
import { HomeComponent } from "./components/home/home.component";

@NgModule({
    declarations: [
        upgradeAdapter.upgradeNg1Component("inlineEdit"),
        upgradeAdapter.upgradeNg1Component("formAccordionList"),
        upgradeAdapter.upgradeNg1Component("formSummaryList"),
        upgradeAdapter.upgradeNg1Component("cdeAccordionList"),
        ProfileComponent,
        LinkedFormsComponent,
        IdentifiersComponent,
        UserCommentsComponent,
        HomeComponent,
        LogAuditComponent,
        UsersMgtComponent,
        PlaceHoldEmptyPipe],
    providers: [],
    imports: [CommonModule, FormsModule, ModalModule.forRoot(), TypeaheadModule.forRoot(),
        PaginationModule.forRoot(), DataTableModule, Select2Module],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SystemModule {
}
