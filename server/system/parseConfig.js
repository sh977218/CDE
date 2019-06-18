const config = require('config');
const fs = require('fs');

['log', 'appData', 'migration'].forEach(databaseName => {
    let database = config.database[databaseName];
    if (database) {
        let uriOptions = [];
        if (database.options.replicaSet)
            uriOptions.push('replicaSet=' + database.options.replicaSet);
        if (database.options.ssl) {
            uriOptions.push('ssl=true');
            if (database.sslCAPath)
                database.options.sslCA = [fs.readFileSync(database.sslCAPath)];
            if (database.sslCertPath)
                database.options.sslCert = fs.readFileSync(database.sslCertPath);
        }
        database.uri = "mongodb://" + database.username + ":" + database.password + "@"
            + config.database.servers.map(srv => srv.host + ":" + srv.port).join(",") + "/" + database.db;
        if (uriOptions.length) database.uri += '?' + uriOptions.join('&');
    }
});
Object.keys(config).forEach(key => exports[key] = config[key]);

config.database.log.cappedCollectionSizeMB = config.database.log.cappedCollectionSizeMB || 1024 * 1024 * 250
