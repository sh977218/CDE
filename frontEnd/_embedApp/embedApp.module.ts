import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ElasticService } from '_app/elastic.service';
import { InactivityLoggedOutComponent, UserService } from '_app/user.service';
import { CommonAppModule } from '_commonApp/commonApp.module';
import { EmbedAppComponent } from './embedApp.component';
import { EmbeddedCdeSearchResultComponent } from './searchResults/embeddedCdeSearchResult.component';
import { EmbeddedFormSearchResultComponent } from './searchResults/embeddedFormSearchResult.component';
import { LocalStorageModule } from 'angular-2-local-storage';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

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
        BrowserAnimationsModule,
        BrowserModule,
        CommonModule,
        LocalStorageModule.forRoot({
            prefix: 'nlmcde',
            storageType: 'localStorage'
        }),
        FormsModule,
        HttpClientModule,
        NgbModule.forRoot(),
        CommonAppModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule
    ],
    entryComponents: [
        InactivityLoggedOutComponent
    ],
    exports: [],
    bootstrap: [EmbedAppComponent]
})
export class EmbedAppModule {
}
