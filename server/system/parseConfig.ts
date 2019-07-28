import * as Config from 'config';
import { readFileSync } from 'fs';

export const config = Config as any;

['log', 'appData', 'migration'].forEach(databaseName => {
    const database = config.database[databaseName];
    if (database) {
        const uriOptions = [];
        if (database.options.replicaSet) {
            uriOptions.push('replicaSet=' + database.options.replicaSet);
        }
        if (database.options.ssl) {
            uriOptions.push('ssl=true');
            if (database.sslCAPath) {
                database.options.sslCA = [readFileSync(database.sslCAPath)];
            }
            if (database.sslCertPath) {
                database.options.sslCert = readFileSync(database.sslCertPath);
            }
        }
        database.uri = 'mongodb://' + database.username + ':' + database.password + '@'
            + config.database.servers.map((srv: any) => srv.host + ':' + srv.port).join(',') + '/' + database.db;
        if (uriOptions.length) {
            database.uri += '?' + uriOptions.join('&');
        }
    }
});

config.database.log.cappedCollectionSizeMB = config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250;
