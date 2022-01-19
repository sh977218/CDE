import { config } from 'server';
import { Logger, transports } from 'winston';

export const noDbLogger = new (Logger)({
    transports: [
        config.logFile
            ? new (transports.File)({
                filename: config.logFile
            })
            : new (transports.Console)()
    ]
});
