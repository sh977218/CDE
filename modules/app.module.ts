import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { CdeAppComponent } from "./app.component";
import { ClassificationService } from "./core/public/classification.service";
import { SkipLogicService } from "./core/public/skipLogic.service";
import { SystemModule } from "./system/public/system.module";
import { CdeModule } from "./cde/public/js/cde.module";
import { FormModule } from "./form/public/form.module";


@NgModule({
    declarations: [CdeAppComponent],
    providers: [
        ClassificationService,
        SkipLogicService],
    imports: [
        NgbModule.forRoot(),
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpModule,
        SystemModule,
        CdeModule,
        FormModule
    ],
    bootstrap: [CdeAppComponent]
})
export class CdeAppModule {
}
