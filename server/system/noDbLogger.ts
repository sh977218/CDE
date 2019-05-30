import { transports, Logger } from 'winston';

const config = require('config');
const Rotate = require('winston-logrotate').Rotate;

export const noDbLogger = new (Logger)({
    transports: [
        config.logFile
            ? new Rotate({
                file: config.logFile
            })
            : new (transports.Console)()
    ]
});
