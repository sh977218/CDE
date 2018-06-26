import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { TimeAgoPipe } from 'time-ago-pipe';

import { FrontExceptionHandler } from '_commonApp/frontExceptionHandler';

@NgModule({
    imports: [
        HttpClientModule,
    ],
    declarations: [
        TimeAgoPipe,
    ],
    providers: [
        {provide: ErrorHandler, useClass: FrontExceptionHandler},
        FrontExceptionHandler,
    ],
    exports: [
        TimeAgoPipe,
    ],
})
export class CommonAppModule {
}
