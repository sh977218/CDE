const mongoose = require('mongoose');
const logger = require('./noDbLogger');

let establishedConns = {};

exports.establishConnection = function (dbConfig) {
    let uri = dbConfig.uri;

    if (establishedConns[uri]) {
        return establishedConns[uri];
    }

    establishedConns[uri] = mongoose.createConnection(uri, dbConfig.options)
        .once('open', () => {
            logger.noDbLogger.info("Connection open to " + dbConfig.db);
        })
        .on('error', function (error) {
            logger.noDbLogger.info("Error connection open to " + error);
        })
        .on('reconnected', function () {
            logger.noDbLogger.info("Connection open to " + dbConfig.db);
        });

    return establishedConns[uri];
};
