import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { CdeAppComponent } from "./app.component";
import { CoreModule } from "./core/public/core.module";
import { CdeModule } from "./cde/public/js/cde.module";
import { FormModule } from "./form/public/form.module";
import { SystemModule } from "./system/public/system.module";
import { BoardModule } from "./board/public/board.module";

@NgModule({
    declarations: [
        CdeAppComponent
    ],
    providers: [],
    imports: [
        NgbModule.forRoot(),
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpModule,
        CoreModule,
        CdeModule,
        FormModule,
        SystemModule,
        BoardModule
    ],
    bootstrap: [CdeAppComponent]
})
export class CdeAppModule {
}
