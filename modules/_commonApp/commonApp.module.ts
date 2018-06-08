import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from "@angular/core";

import { FrontExceptionHandler } from '_commonApp/frontExceptionHandler';

@NgModule({
    imports: [
        HttpClientModule,
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
