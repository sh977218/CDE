import { CommonModule } from "@angular/common";
import { ErrorHandler, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { BrowserModule } from "@angular/platform-browser";
import { UpgradeModule } from "@angular/upgrade/static";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { BoardModule } from "./board/public/board.module";
import { CdeAppComponent } from "./app.component";
import { CdeModule } from "./cde/public/cde.module";
import { CoreModule } from "./core/public/core.module";
import { DiscussModule } from "./discuss/discuss.module";
import { FormModule } from "./form/public/form.module";
import { SystemModule } from "./system/public/system.module";
import { QuickBoardModule } from 'quickBoard/public/quickBoard.module';
import { QuickBoardListService } from 'quickBoard/public/quickBoardList.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


class FrontExceptionHandler implements ErrorHandler {
    previousException;
    lock = false;

    handleError (error) {
        //
        // $provide.decorator("$exceptionHandler", ['$delegate', '$injector',
        //     function ($delegate, $injector) {
        //         return function (exception, cause) {
        //             $delegate(exception, cause);
        if (this.previousException && error.toString() === this.previousException.toString()) return;
        this.previousException = error;
        try {
            // if (exception.message.indexOf("[$compile:tpload]") > -1) return;
            // if (!lock) {
            //     lock = true;
            //     $injector.get('$http').post('/logClientException', {
            //         stack: exception.stack,
            //         message: exception.message,
            //         name: exception.name,
            //         url: window.location.href
            //     });
            //     $injector.get('$timeout')(function () {
            //         lock = false;
            //     }, 5000);
            // }
        } catch (e) {

        }
        // };
        // }]);

    }
}

@NgModule({
    declarations: [
        CdeAppComponent
    ],
    providers: [
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
        QuickBoardModule
    ],
    bootstrap: [CdeAppComponent]
})
export class CdeAppModule {
}
