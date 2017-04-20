const mongoose = require('mongoose'),
      config = require('config');

var establishedConns = {};

// require('mongoose-schema-jsonschema')(mongoose);

exports.establishConnection = function(dbConfig) {
    var uri = "mongodb://" + dbConfig.username + ":" + dbConfig.password + "@" +
        config.database.servers.map(function (srv) {
            return srv.host + ":" + srv.port;
        }).join(",") + "/" + dbConfig.db;

    if (establishedConns[uri]) return establishedConns[uri];

    establishedConns[uri] = conn = mongoose.createConnection(uri, dbConfig.options);

    var dbName = /[^/]*$/.exec(uri)[0];

    console.log("connecting to " + dbName);
    conn.once('open', function () {
        console.log('MongoDB connection open to ' + dbName);
    });
    conn.on('reconnected', function () {
        console.log('MongoDB reconnected to ' + dbName);
    });

    return establishedConns[uri];
};

