import * as Config from 'config';

export const config = Config as any;

['log', 'appData'].forEach(databaseName => {
    const database = config.database[databaseName];
    if (database) {
        const uriOptions: string[] = [];
        if (database.options.maxPoolSize) {
            uriOptions.push('maxPoolSize=' + database.options.maxPoolSize);
            delete database.options.maxPoolSize;
        }
        if (database.options.replicaSet) {
            uriOptions.push('replicaSet=' + database.options.replicaSet);
        }
        if (database.options.directConnection) {
            uriOptions.push('directConnection=true');
        }
        if (database.options.ssl) {
            uriOptions.push('tls=true');
            if (database.sslCAPath) {
                database.options.tlsCAFile = database.sslCAPath;
            }
            if (database.sslCertPath) {
                database.options.tlsCertificateKeyFile = database.sslCertPath;
            }
        }
        if (database.options.tlsAllowInvalidCertificates) {
            uriOptions.push('tlsAllowInvalidCertificates=true');
        }
        database.uri = 'mongodb://';
        if (database.username) {
            database.uri = database.uri + database.username + ':' + database.password + '@';
        }
        database.uri =
            database.uri +
            config.database.servers.map((srv: any) => srv.host + ':' + srv.port).join(',') +
            '/' +
            database.db;
        // OOO: --authenticationDatabase comes from:   1. authSource   2. this uri '/db'   3. 'admin'
        if (uriOptions.length) {
            database.uri += '?' + uriOptions.join('&');
        }
    }
});

config.elastic.options = {
    nodes: config.elastic.hosts.map((s: string) => ({
        url: new URL(s),
        ssl: { rejectUnauthorized: false },
    })),
};

config.database.log.cappedCollectionSizeMB = config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250;
