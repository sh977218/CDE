import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";

import { CdeAppComponent } from "./app.component";
import { ClassificationService } from "./core/public/classification.service";
import { SkipLogicService } from "./core/public/skipLogic.service";
import { MergeFormService } from "./core/public/mergeForm.service";
import { SystemModule } from "./system/public/system.module";
import { FormModule } from "./form/public/form.module";
import { CdeModule } from "./cde/public/js/cde.module";


@NgModule({
    declarations: [CdeAppComponent],
    providers: [
        ClassificationService,
        SkipLogicService,
        MergeFormService],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpModule,
        SystemModule,
        FormModule,
        CdeModule
    ],
    bootstrap: [CdeAppComponent]
})
export class CdeAppModule {
}
