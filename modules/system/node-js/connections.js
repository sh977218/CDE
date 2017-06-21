const mongoose = require('mongoose'),
      config = require('config')
;

let establishedConns = {};

// require('mongoose-schema-jsonschema')(mongoose);

exports.establishConnection = function(dbConfig) {
    let uri = "mongodb://" + dbConfig.username + ":" + dbConfig.password + "@" +
        config.database.servers.map(function (srv) {
            return srv.host + ":" + srv.port;
        }).join(",") + "/" + dbConfig.db;

    if (establishedConns[uri]) return establishedConns[uri];

    establishedConns[uri] = conn = mongoose.createConnection(uri, dbConfig.options);

    let dbName = /[^/]*$/.exec(uri)[0];

    conn.once('open', function () {
    });
    conn.on('reconnected', function () {
    });

    return establishedConns[uri];
};

