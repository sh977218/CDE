const passportSocketIo = require('passport.socketio');
const config = require('../system/parseConfig');

exports.startServer = function (server, expressSettings) {
    let ioServer = require('socket.io')(server);
    let mongoAdapter = require('socket.io-adapter-mongo');
    if (config.database.appData && config.database.appData.options && config.database.appData.options.server) {
        ioServer.adapter(mongoAdapter(config.mongoUri, config.database.appData.options.server));
    } else ioServer.adapter(mongoAdapter(config.mongoUri));
    exports.ioServer = ioServer;
    ioServer.use(passportSocketIo.authorize(expressSettings));
    ioServer.of("/comment").on('connection', function (client) {
        client.on("room", function (roomId) {
            client.join(roomId);
        });
        client.on("currentReplying", function (roomId, commentId) {
            ioServer.of("/comment").to(roomId).emit("userTyping", {
                commentId: commentId,
                username: client.conn.request.user.username
            });
        });
    });
};