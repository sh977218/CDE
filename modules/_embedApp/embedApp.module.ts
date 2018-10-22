import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatDialogModule, MatIconModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ElasticService } from '_app/elastic.service';
import { InactivityLoggedOutComponent, UserService } from '_app/user.service';
import { CommonAppModule } from '_commonApp/commonApp.module';
import { EmbedAppComponent } from '_embedApp/embedApp.component';
import { EmbeddedCdeSearchResultComponent } from '_embedApp/searchResults/embeddedCdeSearchResult.component';
import { EmbeddedFormSearchResultComponent } from '_embedApp/searchResults/embeddedFormSearchResult.component';
import { LocalStorageModule } from 'angular-2-local-storage';
import { OrgHelperService } from 'core/orgHelper.service';


@NgModule({
    declarations: [
        EmbedAppComponent,
        EmbeddedCdeSearchResultComponent,
        EmbeddedFormSearchResultComponent,
        InactivityLoggedOutComponent,
    ],
    providers: [
        ElasticService,
        OrgHelperService,
        UserService,
    ],
    imports: [
        BrowserModule,
        CommonModule,
        LocalStorageModule.withConfig({
            prefix: 'nlmcde',
            storageType: 'localStorage'
        }),
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NgbModule.forRoot(),
        CommonAppModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
    ],
    entryComponents: [
        InactivityLoggedOutComponent
    ],
    exports: [
    ],
    bootstrap: [EmbedAppComponent]
})
export class EmbedAppModule {
}
