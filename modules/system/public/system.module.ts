import { CommonModule } from "@angular/common";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { Select2Module } from "ng2-select2";
import { CKEditorModule } from 'ng2-ckeditor';

import { CdeAccordionListDirective, FormAccordionListDirective, FormSummaryListDirective } from "./upgrade-components";
import { ProfileComponent } from "./components/profile.component";
import { LinkedFormsComponent } from "./components/linkedForms.component";
import { UserCommentsComponent } from "./components/userComments.component";
import { HomeComponent } from "./components/home/home.component";
import { ListManagementComponent } from "./components/siteAdmin/listManagement/listManagement.component";
import { LogAuditComponent } from "./components/siteAdmin/logAudit/logAudit.component";
import { UsersMgtComponent } from "./components/siteAdmin/usersMgt/usersMgt.component";
import { DailyUsageComponent } from "./components/siteAdmin/dailyUsage/dailyUsage.component";
import { OrgAdminComponent } from "./components/siteAdmin/orgAdmin/orgAdmin.component";
import { JsonpModule } from "@angular/http";
import { NavigationComponent } from "./components/navigation.component";
import { TruncateLongNamePipe } from "./truncateLongName.pipe";
import { OrgHelperService } from "../orgHelper.service";
import { InlineEditComponent } from "./components/inlineEdit/inlineEdit.component";
import { InlineAreaEditComponent } from "./components/inlineEdit/inlineAreaEdit.component";
import { PlaceHoldEmptyPipe } from "./placeHoldEmpty.pipe";
import { TextTruncateComponent } from "./components/textTruncate/textTruncate.component";
import { AlertComponent } from "./components/alert/alert.component";
import { AlertService } from "./components/alert/alert.service";

@NgModule({
    imports: [
        CKEditorModule,
        CommonModule,
        FormsModule,
        Select2Module,
        NgbModule,
        JsonpModule,
    ],
    declarations: [
        AlertComponent,
        CdeAccordionListDirective,
        DailyUsageComponent,
        FormAccordionListDirective,
        FormSummaryListDirective,
        HomeComponent,
        LinkedFormsComponent,
        ListManagementComponent,
        LogAuditComponent,
        NavigationComponent,
        OrgAdminComponent,
        PlaceHoldEmptyPipe,
        ProfileComponent,
        TruncateLongNamePipe,
        UserCommentsComponent,
        UsersMgtComponent,
        InlineEditComponent,
        InlineAreaEditComponent,
        TextTruncateComponent,
    ],
    entryComponents: [
        AlertComponent,
        DailyUsageComponent,
        HomeComponent,
        LinkedFormsComponent,
        ListManagementComponent,
        LinkedFormsComponent,
        LogAuditComponent,
        NavigationComponent,
        OrgAdminComponent,
        ProfileComponent,
        UsersMgtComponent,
    ],
    exports: [
        LinkedFormsComponent,
        NavigationComponent,
        InlineEditComponent,
        InlineAreaEditComponent,
        PlaceHoldEmptyPipe,
        TextTruncateComponent,
    ],
    providers: [
        AlertService,
        OrgHelperService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class SystemModule {
}
