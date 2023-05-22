import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import * as StackTraceParser from 'stacktrace-parser';
import { PublishLogService } from './publish-log.service';
import { ClientLog } from '_app/client-log.module';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    clientLog!: ClientLog;

    constructor(private injector: Injector) {}

    handleError(error: Error & { status?: number }) {
        const logService = this.injector.get(PublishLogService);
        const location = this.injector.get(LocationStrategy);
        const url = location instanceof PathLocationStrategy ? location.path() : '';
        const errorMessage = error.message ? error.message : error.toString();
        const errorStatus = error.status || null;
        const stack = error instanceof HttpErrorResponse ? null : StackTraceParser.parse(error.message);

        console.error(error);

        if (error instanceof HttpErrorResponse) {
            this.clientLog = new ClientLog(
                'HTTP Error for URL: ' + url,
                'Error Message: ' + errorMessage + ' Error Status: ' + errorStatus,
                stack != null ? stack[0] : '',
                'error'
            );
            logService.log(this.clientLog);
        } else {
            this.clientLog = new ClientLog(
                'Javascript/Typescript Error for URL: ' + url,
                'Error Message: ' + errorMessage + ' Error Status: ' + errorStatus,
                stack != null ? stack[0] : '',
                'error'
            );
            logService.log(this.clientLog);
        }
    }
}
