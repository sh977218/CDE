import '@angular/localize/init';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { TourMatMenuModule } from 'ngx-ui-tour-md-menu';
import { environment } from 'environments/environment';
import { CdeAppComponent } from '_app/app.component';
import { CdeAppRoutingModule } from '_app/app-routing.module';
import { BackForwardService } from '_app/backForward.service';
import { ShutdownBannerComponent } from '_app/banner/shutdownBanner.component';
import { IEBannerComponent } from '_app/banner/ieBanner.component';
import { ElasticService } from '_app/elastic.service';
import { LoginService } from '_app/login.service';
import { NavigationComponent } from '_app/navigation/navigation.component';
import { NotificationService } from '_app/notifications/notification.service';
import { TruncateLongNamePipe } from '_app/truncateLongName.pipe';
import { InactivityLoggedOutComponent, UserService } from '_app/user.service';
import { AlertModule } from 'alert/alert.module';
import { LocalStorageService } from 'non-core/localStorage.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { FormResolve } from 'form/formDescription/form.resolve';
import { LoginFederatedComponent } from '_app/loginFederated.component';
import { CdeTourService } from '_app/cdeTour.service';
import { NotificationDialogComponent } from '_app/notifications/notification-dialog/notification-dialog.component';
import { GlobalErrorHandler } from '_app/global-error-handler';
import { UswdsBannerComponent } from '_app/banner/uswdsBanner.component';
import { FooterComponent } from 'footer/footer.component';
import { MyBoardsService } from 'board/myBoards.service';

@NgModule({
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        RouterModule,
        HttpClientModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatButtonModule,
        MatChipsModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatSelectModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        ScrollingModule,
        // internal
        CdeAppRoutingModule,
        AlertModule,
        TourMatMenuModule,
        LoggerModule.forRoot({
            level: environment.production ? NgxLoggerLevel.OFF : NgxLoggerLevel.TRACE,
            serverLogLevel: NgxLoggerLevel.ERROR,
            serverLoggingUrl: '/server/log/clientExceptionLogs',
        }),
        UswdsBannerComponent,
        FooterComponent,
    ],
    declarations: [
        CdeAppComponent,
        NotificationDialogComponent,
        LoginFederatedComponent,
        IEBannerComponent,
        ShutdownBannerComponent,
        InactivityLoggedOutComponent,
        NavigationComponent,
        TruncateLongNamePipe,
    ],
    providers: [
        FormResolve,
        LocalStorageService,
        BackForwardService,
        ElasticService,
        LoginService,
        NotificationService,
        UserService,
        OrgHelperService,
        CdeTourService,
        MyBoardsService,
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
    ],
    exports: [],
    bootstrap: [CdeAppComponent],
})
export class CdeAppModule {}
