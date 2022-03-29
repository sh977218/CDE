import { ErrorHandler, NgModule } from '@angular/core';
import { FrontExceptionHandler } from '_app/frontExceptionHandler';

@NgModule({
    imports: [
    ],
    declarations: [
    ],
    providers: [
        {provide: ErrorHandler, useClass: FrontExceptionHandler},
    ],
    exports: [
    ],
})
export class CommonAppModule {
}
