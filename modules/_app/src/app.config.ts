import { CommonModule } from '@angular/common';
import { ApplicationConfig, ErrorHandler, importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterModule, TitleStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatListModule } from '@angular/material/list';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { environment } from 'environments/environment';

import { GlobalErrorHandler } from '_app/global-error-handler';
import { TokenInterceptor } from '_app/token.interceptor';
import { PageTitleStrategy } from '_app/page-title-strategy';
import { app_routes } from '_app/src/app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        provideRouter(app_routes),
        importProvidersFrom([CommonModule, BrowserAnimationsModule, FormsModule, BrowserModule, RouterModule]),
        importProvidersFrom([
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
        ]),
        { provide: TitleStrategy, useClass: PageTitleStrategy },
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
        importProvidersFrom(
            LoggerModule.forRoot({
                level: environment.production ? NgxLoggerLevel.OFF : NgxLoggerLevel.TRACE,
                serverLogLevel: NgxLoggerLevel.ERROR,
                serverLoggingUrl: '/server/log/clientExceptionLogs',
            })
        ),
    ],
};
