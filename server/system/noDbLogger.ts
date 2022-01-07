import { transports, Logger } from 'winston';

const config = require('config');

export const noDbLogger = new (Logger)({
    transports: [
        config.logFile
            ? new (transports.File)({
                filename: config.logFile
            })
            : new (transports.Console)()
    ]
});
