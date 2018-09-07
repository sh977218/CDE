const config = require('config');
const fs = require('fs');

let databaseNames = ['log', 'appData', 'migration'];


databaseNames.forEach(databaseName => {
    let database = config.database[databaseName];
    let hosts = config.database.servers.map(srv => srv.host + ":" + srv.port).join(",");
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
    database.uri = "mongodb://" + database.username + ":" + database.password + "@" + hosts + "/" + database.db;
    if (uriOptions) database.uri = database.uri + '?' + uriOptions.join('&');
});
Object.keys(config).forEach(function (key) {
    exports[key] = config[key];
});
