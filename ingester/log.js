var winston = require('winston');

var directory = __dirname;

exports.setDirectory = function (newDirectory) {
    directory = newDirectory;
};

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({json: false, timestamp: true}),
        new winston.transports.File({filename: directory + '/debug.log', json: false})
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({json: false, timestamp: true}),
        new winston.transports.File({filename: directory + '/exceptions.log', json: false})
    ],
    exitOnError: false
});

module.exports = logger;