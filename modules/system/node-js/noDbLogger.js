const winston = require('winston'),
    config = require('config'),
    Rotate = require('winston-logrotate').Rotate
;


const noDbLogger = config.logFile ? {
    transports: [
        new Rotate({
            file: config.logFile
        })
    ]} : {
    transports: [new (winston.transports.Console)()]
};


exports.noDbLogger = new (winston.Logger)(noDbLogger);
