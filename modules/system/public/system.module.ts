import { upgradeAdapter } from "../../upgrade";
import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { DataTableModule } from "angular2-datatable";
import { Select2Module } from "ng2-select2";
import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { ProfileComponent } from "./components/profile.component";
import { LinkedFormsComponent } from "./components/linkedForms.component";
import { UserCommentsComponent } from "./components/userComments.component";
import { RegistrationComponent } from "./components/adminItem/registration.component";
import { HomeComponent } from "./components/home/home.component";
import { LogAuditComponent } from "./components/siteAdmin/logAudit/logAudit.component";
import { UsersMgtComponent } from "./components/siteAdmin/usersMgt/usersMgt.component";
import { IdentifiersComponent } from "../../admin/public/components/identifiers.component";
import { PropertiesComponent } from "../../admin/public/components/properties.component";
import { AdminModule } from "../../admin/public/admin.module";
import { NamingComponent } from "../../admin/public/components/naming.component";
import { ReferenceDocumentComponent } from "../../admin/public/components/referenceDocument.component";
import { JsonpModule } from "@angular/http";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        DataTableModule,
        Select2Module,
        NgbModule,
        JsonpModule,
        AdminModule,
    ],
    declarations: [
        upgradeAdapter.upgradeNg1Component("cdeAccordionList"),
        upgradeAdapter.upgradeNg1Component("formAccordionList"),
        upgradeAdapter.upgradeNg1Component("formSummaryList"),
        ProfileComponent,
        LinkedFormsComponent,
        IdentifiersComponent,
        PropertiesComponent,
        NamingComponent,
        ReferenceDocumentComponent,
        UserCommentsComponent,
        HomeComponent,
        LogAuditComponent,
        RegistrationComponent,
        UsersMgtComponent,
        PlaceHoldEmptyPipe],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SystemModule {
}
