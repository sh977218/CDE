import { ErrorHandler, NgModule } from "@angular/core";
import { HttpModule } from "@angular/http";

import { FrontExceptionHandler } from '_commonApp/frontExceptionHandler';


@NgModule({
    imports: [
        HttpModule,
    ],
    declarations: [
    ],
    providers: [
        {provide: ErrorHandler, useClass: FrontExceptionHandler},
        FrontExceptionHandler,
    ],
    exports: [
    ],
})
export class CommonAppModule {
}
