import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {BrowserModule} from "@angular/platform-browser";

import {CdeAppComponent} from "./app.component";
import {ClassificationService} from "./core/public/classification.service";
import {SkipLogicService} from "./core/public/skipLogic.service";
import {SystemModule} from "./system/public/system.module";


@NgModule({
    declarations: [CdeAppComponent],
    providers: [
        ClassificationService,
        SkipLogicService],
    imports: [
        BrowserModule,
        CommonModule,
        HttpModule,
        SystemModule
    ],
    bootstrap: [CdeAppComponent]
})
export class CdeAppModule {
}
