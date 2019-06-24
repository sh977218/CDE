import { createConnection } from 'mongoose';
import { noDbLogger } from './noDbLogger';

let establishedConns = {};
export function establishConnection(dbConfig) {
    let uri = dbConfig.uri;

    if (establishedConns[uri]) {
        return establishedConns[uri];
    }

    establishedConns[uri] = createConnection(uri, dbConfig.options)
        .once('open', () => noDbLogger.info("Connection open to " + dbConfig.db))
        .on('error', error => noDbLogger.info("Error connection open to " + error))
        .on('reconnected', () => noDbLogger.info("Connection open to " + dbConfig.db));

    return establishedConns[uri];
}
