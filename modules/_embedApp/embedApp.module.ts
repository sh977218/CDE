import { CommonModule } from "@angular/common";
import { ErrorHandler, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FrontExceptionHandler } from '_app/frontExceptionHandler';
import { EmbedAppComponent } from '_embedApp/embedApp.component';

import "rxjs/add/operator/map";
import { CoreModule } from 'core/core.module';
import { LocalStorageModule } from 'angular-2-local-storage';
import { EmbeddedCdeSearchResultComponent } from '_embedApp/searchResults/embeddedCdeSearchResult.component';
import { EmbeddedFormSearchResultComponent } from '_embedApp/searchResults/embeddedFormSearchResult.component';
import { ElasticService } from '_app/elastic.service';
import { UserService } from '_app/user.service';

@NgModule({
    declarations: [
        EmbedAppComponent,
        EmbeddedCdeSearchResultComponent,
        EmbeddedFormSearchResultComponent,
    ],
    providers: [
        {provide: ErrorHandler, useClass: FrontExceptionHandler},
        ElasticService,
        UserService
    ],
    imports: [
        BrowserModule,
        CommonModule,
        LocalStorageModule.withConfig({
            prefix: "nlmcde",
            storageType: "localStorage"
        }),
        CoreModule,
        FormsModule,
        HttpModule,
        BrowserAnimationsModule,
        NgbModule.forRoot(),
    ],
    exports: [
    ],
    bootstrap: [EmbedAppComponent]
})
export class EmbedAppModule {
}
