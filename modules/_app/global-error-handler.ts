import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { NGXLogger } from 'ngx-logger';
import { ClientErrorExtraInfo } from 'shared/log/audit';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private injector: Injector, private logger: NGXLogger) {}

    handleError(error: Error & { status?: number }) {
        console.error(error);

        const location = this.injector.get(LocationStrategy);
        const url = location instanceof PathLocationStrategy ? location.path() : '';

        const clientLog: ClientErrorExtraInfo = {
            stack: error.stack || '',
            url,
        };
        this.logger.error(clientLog);
    }
}
