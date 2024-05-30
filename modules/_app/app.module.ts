import '@angular/localize/init';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
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
import { environment } from 'environments/environment';
import { CdeAppComponent } from '_app/app.component';
import { CdeAppRoutingModule } from '_app/app-routing.module';
import { ShutdownBannerComponent } from '_app/banner/shutdownBanner.component';
import { NavigationComponent } from '_app/navigation/navigation.component';
import { TruncateLongNamePipe } from '_app/truncateLongName.pipe';
import { AlertModule } from 'alert/alert.module';
import { NotificationDialogComponent } from '_app/notifications/notification-dialog/notification-dialog.component';
import { GlobalErrorHandler } from '_app/global-error-handler';
import { UswdsBannerComponent } from '_app/banner/uswdsBanner.component';
import { FooterComponent } from 'footer/footer.component';
import { LoginComponent } from '../login/login.component';
import { TokenInterceptor } from './token.interceptor';

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
        LoggerModule.forRoot({
            level: environment.production ? NgxLoggerLevel.OFF : NgxLoggerLevel.TRACE,
            serverLogLevel: NgxLoggerLevel.ERROR,
            serverLoggingUrl: '/server/log/clientExceptionLogs',
        }),
        UswdsBannerComponent,
        FooterComponent,
        LoginComponent,
    ],
    declarations: [
        CdeAppComponent,
        NotificationDialogComponent,
        ShutdownBannerComponent,
        NavigationComponent,
        TruncateLongNamePipe,
    ],
    providers: [
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    ],
    exports: [],
    bootstrap: [CdeAppComponent],
})
export class CdeAppModule {}
