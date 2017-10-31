import { ErrorHandler, NgModule } from "@angular/core";
import { HttpModule } from "@angular/http";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { LocalStorageModule } from 'angular-2-local-storage';

import { AlertComponent } from '_app/alert/alert.component';
import { AlertService } from '_app/alert/alert.service';
import { CdeAppRoutingModule } from '_app/app-routing.module';
import { CdeAppComponent } from '_app/app.component';
import { FrontExceptionHandler } from '_app/frontExceptionHandler';
import { LoginService } from '_app/login.service';
import { NavigationComponent } from '_app/navigation/navigation.component';
import { PageNotFoundComponent } from '_app/pageNotFound/pageNotFoundComponent';
import { QuickBoardListService } from '_app/quickBoardList.service';
import { TruncateLongNamePipe } from '_app/truncateLongName.pipe';
import { UserService } from '_app/user.service';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpModule,
        LocalStorageModule.withConfig({
            prefix: "nlmcde",
            storageType: "localStorage"
        }),
        NgbModule.forRoot(),
        CdeAppRoutingModule,
    ],
    declarations: [
        AlertComponent,
        CdeAppComponent,
        NavigationComponent,
        PageNotFoundComponent,
        TruncateLongNamePipe,
    ],
    providers: [
        AlertService,
        {provide: ErrorHandler, useClass: FrontExceptionHandler},
        LoginService,
        QuickBoardListService,
        UserService
    ],
    exports: [
        PageNotFoundComponent,
    ],
    bootstrap: [CdeAppComponent]
})
export class CdeAppModule {
}
