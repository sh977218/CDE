import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { CoreModule } from "core/public/core.module";
import { FormModule } from "form/public/form.module";
import { NativeRenderStandaloneComponent } from "./nativeRenderStandalone.component";

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpModule,
        NgbModule.forRoot(),
        // internal
        CoreModule,
        FormModule,
    ],
    declarations: [
        NativeRenderStandaloneComponent,
    ],
    entryComponents: [
        NativeRenderStandaloneComponent,
    ],
    exports: [
    ],
    providers: [
    ],
    bootstrap: [NativeRenderStandaloneComponent]
})
export class NativeRenderStandaloneModule {
}
