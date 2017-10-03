import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { UpgradeModule } from "@angular/upgrade/static";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { QuickBoardModule } from 'quickBoard/public/quickBoard.module';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from "@angular/router";

import { CdeAppComponent } from 'app.component';
import { CdeModule } from 'cde/public/cde.module';
import { BoardModule } from 'board/public/board.module';
import { CoreModule } from 'core/public/core.module';
import { DiscussModule } from 'discuss/discuss.module';
import { FormModule } from 'form/public/form.module';
import { SystemModule } from 'system/public/system.module';

const appRoutes: Routes = [
];

@NgModule({
    declarations: [
        CdeAppComponent
    ],
    providers: [
        QuickBoardListService,
        // {provide: ErrorHandler, useClass: FrontExceptionHandler}
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
        RouterModule.forRoot(
            appRoutes,
            { enableTracing: true } // <-- debugging purposes only
        )
    ],
    exports: [RouterModule],
    bootstrap: [CdeAppComponent]
})
export class CdeAppModule {
}
