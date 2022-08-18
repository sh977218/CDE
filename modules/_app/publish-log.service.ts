import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { ClientLog } from '_app/client-log.module';

@Injectable({
    providedIn: 'root',
})
export class PublishLogService {
    previousLogMsg: ClientLog;

    constructor(private logger: NGXLogger) {}

    log(logMsg: ClientLog) {
        this.logger.error(logMsg);
    }
}
