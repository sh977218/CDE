var mongoose = require('mongoose');

var establishedConns = {};

exports.establihConnection = function(uri, onReconnect) {
    var opts = {auth: {authdb: "admin"}};
    if (establishedConns[uri]) return establishedConns[uri];

    establishedConns[uri] = conn = mongoose.createConnection(uri, opts);

    console.log("connecting to : " + type);
    conn.once('open', function () {
        console.log('MongoDB ' + _type + ' connection open');
    });
    conn.on('error', function (error) {
        console.error('Error in MongoDb ' + _type + ' connection: ' + error);
        mongoose.disconnect();
    });
    conn.on('reconnected', function () {
        console.log('MongoDB ' + _type + ' reconnected!');
    });
    conn.on('disconnected', function () {
        console.log('MongoDB ' + _type + ' disconnected!, reconnecting in 2 seconds');
        setTimeout(function () {
            establishedConns[uri] = conn = mongoose.createConnection(uri);
            connect(openCb);
        }, 2 * 1000);
    });
};

var connectionEstablisher = function (uri, type) {
    this.uri = uri;
    var _type = type;
    var opts = {auth: {authdb: "admin"}};
    var conn = mongoose.createConnection(uri, opts);
    this.connect = function (openCb) {
        console.log("connecting to : " + type);
        conn.once('open', function () {
            console.log('MongoDB ' + _type + ' connection open');
            openCb(conn);
        });
        conn.on('error', function (error) {
            console.error('Error in MongoDb ' + _type + ' connection: ' + error);
            mongoose.disconnect();
        });
        conn.on('reconnected', function () {
            console.log('MongoDB ' + _type + ' reconnected!');
        });
        conn.on('disconnected', function () {
            console.log('MongoDB ' + _type + ' disconnected!, reconnecting in 2 seconds');
            setTimeout(function () {
                conn = mongoose.createConnection(uri);
                connect(openCb);
            }, 2 * 1000);
        });
    };
    var connect = this.connect;
};


exports.connectionEstablisher = connectionEstablisher;
