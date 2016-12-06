var passportSocketIo = require('passport.socketio');

exports.startServer = function(server, expressSettings) {
    var ioServer = require('socket.io')(server);
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