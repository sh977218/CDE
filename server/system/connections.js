const mongoose = require('mongoose');
<<<<<<< HEAD
const fs = require('fs');
=======
>>>>>>> b3fc2fd2a31dbe8f81b72feddf73f3757e273fbe
const logger = require('./noDbLogger');

let establishedConns = {};

exports.establishConnection = function (dbConfig) {
    let uri = dbConfig.uri;

    if (establishedConns[uri]) return establishedConns[uri];

    establishedConns[uri] = conn = mongoose.createConnection(uri, dbConfig.options);

    conn.once('open', function () {
        logger.noDbLogger.info("Connection open to " + dbConfig.db);
    });
    conn.on('error', function (error) {
        logger.noDbLogger.info("Error connection open to " + error);
    });
    conn.on('reconnected', function () {
        logger.noDbLogger.info("Connection open to " + dbConfig.db);
    });

    return establishedConns[uri];
};

