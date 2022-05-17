import { config } from 'server';
import { authorize } from 'passport.socketio';

const {createAdapter} = require('@socket.io/mongo-adapter');

const DB = config.database.appData.db;
const COLLECTION = 'socket.io-adapter-events';
export let ioServer: any;

export async function startSocketIoServer(server: any, expressSettings: any, mongoClient: any) {
    ioServer = require('socket.io')(server, {
        cors: {
            origins: ['http://localhost:4200', 'http://localhost:3001']
        }
    });
    ioServer.use(authorize(expressSettings));
    try {
        await mongoClient.db(DB).createCollection(COLLECTION, {
            capped: true,
            size: 1e6
        });
    } catch (e) {
    }
    const mongoCollection = mongoClient.db(DB).collection(COLLECTION)
    ioServer.adapter(createAdapter(mongoCollection));

    ioServer.of('/comment').on('connection', (client: any) => {
        client.on('room', (roomId: any) => {
            client.join(roomId);
        });
        client.on('currentReplying', (roomId: any, commentId: any) => {
            ioServer.of('/comment').to(roomId).emit('userTyping', {
                commentId,
                username: client.conn.request.user && client.conn.request.user.username
            });
        });
    });
}

