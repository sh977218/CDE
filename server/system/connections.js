const mongoose = require('mongoose');
const logger = require('./noDbLogger');

let establishedConns = {};
exports.establishConnection = dbConfig => {
    let uri = dbConfig.uri;

    if (establishedConns[uri]) {
        return establishedConns[uri];
    }

    establishedConns[uri] = mongoose.createConnection(uri, dbConfig.options)
        .once('open', () => logger.noDbLogger.info("Connection open to " + dbConfig.db))
        .on('error', error => logger.noDbLogger.info("Error connection open to " + error))
        .on('reconnected', () => logger.noDbLogger.info("Connection open to " + dbConfig.db));

    return establishedConns[uri];
};
