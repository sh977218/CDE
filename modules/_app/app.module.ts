import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import '@angular/localize/init';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CdeAppComponent } from '_app/app.component';
import { CdeAppRoutingModule } from '_app/app-routing.module';
import { BackForwardService } from '_app/backForward.service';
import { IEBannerComponent } from '_app/banner/ieBanner.component';
import { UswdsBannerComponent } from '_app/banner/uswdsBanner.component';
import { ElasticService } from '_app/elastic.service';
import { LoginService } from '_app/login.service';
import { NavigationComponent } from '_app/navigation/navigation.component';
import { NotificationService } from '_app/notifications/notification.service';
import { TruncateLongNamePipe } from '_app/truncateLongName.pipe';
import { InactivityLoggedOutComponent, UserService } from '_app/user.service';
import { CommonAppModule } from '_commonApp/commonApp.module';
import { AlertModule } from 'alert/alert.module';
import { LocalStorageService } from 'non-core/localStorage.service';
import { OrgHelperService } from 'non-core/orgHelper.service';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { FormResolve } from 'form/public/components/formDescription/form.resolve';
import { NotificationDialogComponent } from "_app/notifications/notification-dialog/notification-dialog.component";
import {RouterModule} from "@angular/router";

@NgModule({
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        HttpClientModule,
        MatBadgeModule,
        MatButtonModule,
        MatChipsModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        ScrollingModule,
        // internal
        CdeAppRoutingModule,
        CommonAppModule,
        AlertModule,
        RouterModule,
    ],
    declarations: [
        CdeAppComponent,
        NotificationDialogComponent,
        IEBannerComponent,
        InactivityLoggedOutComponent,
        NavigationComponent,
        TruncateLongNamePipe,
        UswdsBannerComponent,
    ],
    providers: [
        FormResolve,
        LocalStorageService,
        BackForwardService,
        ElasticService,
        LoginService,
        NotificationService,
        UserService,
        OrgHelperService
    ],
    exports: [],
    entryComponents: [],
    bootstrap: [CdeAppComponent]
})

export class CdeAppModule {
}
