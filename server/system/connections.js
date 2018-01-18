const mongoose = require('mongoose');
const fs = require('fs');
const config = require('config');
const logger = require('./noDbLogger');

let establishedConns = {};

exports.establishConnection = function (dbConfig) {
    if (dbConfig.options && dbConfig.options.sslCAPath) {
        dbConfig.options.server.sslCA = [fs.readFileSync(__dirname + dbConfig.options.sslCAPath)];
        dbConfig.options.server.sslCert = fs.readFileSync(__dirname + dbConfig.options.sslCertPath);
    }

    let uri = "mongodb://" + dbConfig.username + ":" + dbConfig.password + "@" +
        config.database.servers.map(function (srv) {
            return srv.host + ":" + srv.port;
        }).join(",") + "/" + dbConfig.db;

    if (establishedConns[uri]) return establishedConns[uri];

    establishedConns[uri] = conn = mongoose.createConnection(uri, dbConfig.options);

    conn.once('open', function () {
        logger.noDbLogger.info("Connection open to " + dbConfig.db);
    });
    conn.on('reconnected', function () {
        logger.noDbLogger.info("Connection open to " + dbConfig.db);
    });

    return establishedConns[uri];
};

