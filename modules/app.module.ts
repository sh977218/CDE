import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { UpgradeModule } from "@angular/upgrade/static";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { BoardModule } from "./board/public/board.module";
import { CdeAppComponent } from "./app.component";
import { CdeModule } from "./cde/public/cde.module";
import { CoreModule } from "./core/public/core.module";
import { DiscussModule } from "./discuss/discuss.module";
import { FormModule } from "./form/public/form.module";
import { SystemModule } from "./system/public/system.module";

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
        UpgradeModule,
        CoreModule,
        CdeModule,
        FormModule,
        SystemModule,
        BoardModule,
        DiscussModule
    ],
    bootstrap: [CdeAppComponent]
})
export class CdeAppModule {
}
