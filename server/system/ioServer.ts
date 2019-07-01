import { config } from '../system/parseConfig';

const passportSocketIo = require('passport.socketio');

export let ioServer: any;

export function startServer(server, expressSettings) {
    ioServer = require('socket.io')(server);
    let mongoAdapter = require('socket.io-adapter-mongo'); // TODO: update to new version when available for mongodb 3 used by mongoose
    if (config.database.appData.options) {
        ioServer.adapter(mongoAdapter(config.database.appData.uri, config.database.appData.options));
    } else ioServer.adapter(mongoAdapter(config.database.appData.uri));
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
}
