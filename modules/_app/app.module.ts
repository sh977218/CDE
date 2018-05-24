import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap/alert/alert.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap/dropdown/dropdown.module';
import { LocalStorageModule } from 'angular-2-local-storage';
import { NG_SELECT_DEFAULT_CONFIG } from '@ng-select/ng-select';

import { AlertComponent } from '_app/alert/alert.component';
import { AlertService } from '_app/alert/alert.service';
import { BackForwardService } from '_app/backForward.service';
import { CdeAppRoutingModule } from '_app/app-routing.module';
import { CdeAppComponent } from '_app/app.component';
import { CommonAppModule } from '_commonApp/commonApp.module';
import { ElasticService } from '_app/elastic.service';
import { LoginService } from '_app/login.service';
import { NavigationComponent } from '_app/navigation/navigation.component';
import { PageNotFoundComponent } from '_app/pageNotFound/pageNotFound.component';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { TruncateLongNamePipe } from '_app/truncateLongName.pipe';
import { UserService } from '_app/user.service';
import { OrgHelperService } from 'core/orgHelper.service';
import { NotificationsComponent } from "./notifications/notifications.component";

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        LocalStorageModule.withConfig({
            prefix: 'nlmcde',
            storageType: 'localStorage'
        }),
        NgbAlertModule.forRoot(),
        NgbDropdownModule.forRoot(),
        // internal
        CdeAppRoutingModule,
        CommonAppModule,
    ],
    declarations: [
        AlertComponent,
        CdeAppComponent,
        NavigationComponent,
        NotificationsComponent,
        PageNotFoundComponent,
        TruncateLongNamePipe,
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
