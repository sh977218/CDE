import { config } from 'server';
import { authorize } from 'passport.socketio';

export let ioServer: any;

export function startServer(server: any, expressSettings: any) {
    ioServer = require('socket.io')(server);
    const mongoAdapter = require('socket.io-adapter-mongo'); // TODO: update to new version when available for mongodb 3 used by mongoose
    if (config.database.appData.options) {
        ioServer.adapter(mongoAdapter(config.database.appData.uri, config.database.appData.options));
    } else ioServer.adapter(mongoAdapter(config.database.appData.uri));
    ioServer.use(authorize(expressSettings));
    ioServer.of('/comment').on('connection', (client: any) => {
        client.on('room', (roomId: any) => {
            client.join(roomId);
        });
        client.on('currentReplying', (roomId: any, commentId: any) => {
            ioServer.of('/comment').to(roomId).emit('userTyping', {
                commentId,
                username: client.conn.request.user.username
            });
        });
    });
}
