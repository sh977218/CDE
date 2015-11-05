var mongoose = require('mongoose');

var establishedConns = {};

exports.establihConnection = function(uri) {
    var opts = {auth: {authdb: "admin"}};
    if (establishedConns[uri]) return establishedConns[uri];

    establishedConns[uri] = conn = mongoose.createConnection(uri, opts);

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

