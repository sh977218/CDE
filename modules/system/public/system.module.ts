import { upgradeAdapter } from "../../upgrade";
import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PaginationModule, ModalModule, TypeaheadModule } from "ng2-bootstrap/index";
import { DataTableModule } from "angular2-datatable";
import { Select2Module } from "ng2-select2";
import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { ProfileComponent } from "./components/profile.component";
import { LinkedFormsComponent } from "./components/linkedForms.component";
import { IdentifiersComponent } from "./components/adminItem/identifiers.component";
import { PropertiesComponent } from "./components/adminItem/properties.component";
import { UserCommentsComponent } from "./components/userComments.component";
import { HomeComponent } from "./components/home/home.component";
import { LogAuditComponent } from "./components/siteAdmin/logAudit/logAudit.component";
import { UsersMgtComponent } from "./components/siteAdmin/usersMgt/usersMgt.component";

@NgModule({
    declarations: [
        upgradeAdapter.upgradeNg1Component("sortableArray"),
        upgradeAdapter.upgradeNg1Component("inlineEdit"),
        upgradeAdapter.upgradeNg1Component("inlineAreaEdit"),
        upgradeAdapter.upgradeNg1Component("cdeAccordionList"),
        upgradeAdapter.upgradeNg1Component("formAccordionList"),
        upgradeAdapter.upgradeNg1Component("formSummaryList"),
        ProfileComponent,
        LinkedFormsComponent,
        IdentifiersComponent,
        PropertiesComponent,
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
