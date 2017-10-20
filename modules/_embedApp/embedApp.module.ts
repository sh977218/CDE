import { CommonModule } from "@angular/common";
import { ErrorHandler, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CdeAppComponent } from '_app/app.component';
import { FrontExceptionHandler } from '_app/frontExceptionHandler';
import { EmbedAppComponent } from '_embedApp/embedApp.component';

@NgModule({
    declarations: [
        CdeAppComponent,
    ],
    providers: [
        {provide: ErrorHandler, useClass: FrontExceptionHandler}
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpModule,
        BrowserAnimationsModule,
    ],
    exports: [
    ],
    bootstrap: [EmbedAppComponent]
})
export class EmbedAppModule {
}
