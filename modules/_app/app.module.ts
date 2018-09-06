import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';
import { LocalStorageModule } from 'angular-2-local-storage';
import {
    MatBadgeModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule
} from '@angular/material';

import { AlertService } from '_app/alert.service';
import { BackForwardService } from '_app/backForward.service';
import { CdeAppRoutingModule } from '_app/app-routing.module';
import { CdeAppComponent } from '_app/app.component';
import { ElasticService } from '_app/elastic.service';
import { LoginService } from '_app/login.service';
import { NotificationsComponent } from '_app/notifications/notifications.component';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { TruncateLongNamePipe } from '_app/truncateLongName.pipe';
import { InactivityLoggedOutComponent, UserService } from '_app/user.service';
import { NavigationComponent } from '_app/navigation/navigation.component';
import { PageNotFoundComponent } from '_app/pageNotFound/pageNotFound.component';
import { CommonAppModule } from '_commonApp/commonApp.module';
import { OrgHelperService } from 'core/orgHelper.service';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        LocalStorageModule.withConfig({
            prefix: 'nlmcde',
            storageType: 'localStorage'
        }),
        MatBadgeModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatSnackBarModule,
        // internal
        CdeAppRoutingModule,
        CommonAppModule,
    ],
    declarations: [
        CdeAppComponent,
        InactivityLoggedOutComponent,
        NavigationComponent,
        NotificationsComponent,
        PageNotFoundComponent,
        TruncateLongNamePipe,
    ],
    entryComponents: [
        InactivityLoggedOutComponent,
    ],
    providers: [
        {
            provide: NG_SELECT_DEFAULT_CONFIG,
            useValue: {
                appendTo: 'body'
            }
        },
        AlertService,
        BackForwardService,
        ElasticService, // TODO: create shared CoreModule loaded async and provide to all lazy routes
        LoginService,
        QuickBoardListService,
        UserService,
        OrgHelperService
    ],
    exports: [
        PageNotFoundComponent,
    ],
    bootstrap: [CdeAppComponent]
})

export class CdeAppModule {
}
