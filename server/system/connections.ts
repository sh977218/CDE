import { Dictionary } from 'async';
import { Connection, ConnectOptions, createConnection } from 'mongoose';
import { noDbLogger } from 'server/system/noDbLogger';

const establishedConnections: Dictionary<Connection> = {};

export function establishConnection(dbConfig: any) {
    const uri = dbConfig.uri;
    if (!uri) {
        console.error('Missing db uri for' + dbConfig.db);
        process.exit(1);
    }

    if (establishedConnections[uri]) {
        return establishedConnections[uri];
    }

    establishedConnections[uri] = createConnection(uri, dbConfig.options as ConnectOptions)
        .once('open', () => noDbLogger.info('Connection open to ' + dbConfig.db))
        .on('error', error => noDbLogger.info('Error connection open to ' + error))
        .on('reconnected', () => noDbLogger.info('Connection open to ' + dbConfig.db));

    return establishedConnections[uri];
}
