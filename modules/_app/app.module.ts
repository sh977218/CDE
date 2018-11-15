import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import {
    MatBadgeModule,
    MatButtonModule, MatChipsModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';
import { BackForwardService } from '_app/backForward.service';
import { CdeAppRoutingModule } from '_app/app-routing.module';
import { CdeAppComponent } from '_app/app.component';
import { ElasticService } from '_app/elastic.service';
import { IEBannerComponent } from '_app/ieBanner/ieBanner.component';
import { LoginService } from '_app/login.service';
import { NavigationComponent } from '_app/navigation/navigation.component';
import { ApprovalService } from '_app/notifications/approval.service';
import { NotificationService } from '_app/notifications/notification.service';
import { NotificationDrawerComponent } from '_app/notifications/notificationDrawer.component';
import { NotificationDrawerPaneComponent } from '_app/notifications/notificationDrawerPane.component';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { TruncateLongNamePipe } from '_app/truncateLongName.pipe';
import { InactivityLoggedOutComponent, UserService } from '_app/user.service';
import { CommonAppModule } from '_commonApp/commonApp.module';
import { LocalStorageModule } from 'angular-2-local-storage';
import { OrgHelperService } from 'core/orgHelper.service';
import { AlertModule } from 'alert/alert.module';
import { WidgetModule } from 'widget/widget.module';

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
        MatChipsModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatSnackBarModule,
        // internal
        CdeAppRoutingModule,
        CommonAppModule,
        AlertModule
    ],
    declarations: [
        CdeAppComponent,
        IEBannerComponent,
        InactivityLoggedOutComponent,
        NavigationComponent,
        NotificationDrawerComponent,
        NotificationDrawerPaneComponent,
        TruncateLongNamePipe
    ],
    entryComponents: [
        InactivityLoggedOutComponent,
        NotificationDrawerPaneComponent
    ],
    providers: [
        {
            provide: NG_SELECT_DEFAULT_CONFIG,
            useValue: {
                appendTo: 'body'
            }
        },
        ApprovalService,
        BackForwardService,
        ElasticService, // TODO: create shared CoreModule loaded async and provide to all lazy routes
        LoginService,
        NotificationService,
        QuickBoardListService,
        UserService,
        OrgHelperService
    ],
    exports: [
    ],
    bootstrap: [CdeAppComponent]
})

export class CdeAppModule {
}
