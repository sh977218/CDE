var mongoose = require('mongoose');

var connectionEstablisher = function(uri, type) {
    this.uri = uri;
    var _type = type;
    var conn = mongoose.createConnection(uri);
    this.connect = function (openCb) {
        console.log("connecting to : " + uri);
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
            console.log('MongoDB ' + _type + ' disconnected!, reconnecting in 10 seconds');
            setTimeout(function() {
                conn = mongoose.createConnection(uri);
                connect(openCb);
            }, 10 * 1000);
        });
    };
    var connect = this.connect;
};

exports.connectionEstablisher = connectionEstablisher;
