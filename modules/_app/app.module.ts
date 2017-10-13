import { CommonModule } from "@angular/common";
import { ErrorHandler, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { UpgradeModule } from "@angular/upgrade/static";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { QuickBoardModule } from 'quickBoard/public/quickBoard.module';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from "@angular/router";

import { CdeModule } from 'cde/public/cde.module';
import { BoardModule } from 'board/public/board.module';
import { CoreModule } from 'core/public/core.module';
import { DiscussModule } from 'discuss/discuss.module';
import { FormModule } from 'form/public/form.module';
import { SystemModule } from 'system/public/system.module';
import { CdeAppComponent } from '_app/app.component';
import { FrontExceptionHandler } from '_app/frontExceptionHandler';
import { NavigationComponent } from '_app/navigation/navigation.component';
import { PageNotFoundComponent } from '_app/pageNotFound/pageNotFoundComponent';
import { AlertService } from '_app/alert/alert.service';
import { AlertComponent } from '_app/alert/alert.component';
import { TruncateLongNamePipe } from '_app/truncateLongName.pipe';

const appRoutes: Routes = [
    { path: '**', component: PageNotFoundComponent }
];

@NgModule({
    declarations: [
        AlertComponent,
        CdeAppComponent,
        NavigationComponent,
        PageNotFoundComponent,
        TruncateLongNamePipe,
    ],
    providers: [
        AlertService,
        QuickBoardListService,
        {provide: ErrorHandler, useClass: FrontExceptionHandler}
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        HttpModule,
        BrowserAnimationsModule,
        NgbModule.forRoot(),
        UpgradeModule,
        // internal
        BoardModule,
        CdeModule,
        CoreModule,
        DiscussModule,
        FormModule,
        SystemModule,
        QuickBoardModule,
        RouterModule.forRoot(appRoutes)
    ],
    exports: [
        PageNotFoundComponent,
        RouterModule,
    ],
    bootstrap: [CdeAppComponent]
})
export class CdeAppModule {
}
