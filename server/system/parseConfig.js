const config = require('config');
const fs = require('fs');

let databaseNames = ['log', 'appData'];

databaseNames.forEach(databaseName => {
    let database = config.database[databaseName];
    let hosts = config.database.servers.map(srv => srv.host + ":" + srv.port).join(",");
    let uriOptions = [];
    if (database.options.replicaSet)
        uriOptions.push('replicaSet=' + database.options.replicaSet);
    if (database.options.ssl)
        uriOptions.push('ssl=true');
    database.uri = "mongodb://" + database.username + ":" + database.password + "@" + hosts + "/" + database.db;
    if (uriOptions) database.uri = database.uri + '?' + uriOptions.join('&');
    if (database.options.sslCA)
        database.options.sslCA = [fs.readFileSync(database.options.sslCA)];
    if (database.options.sslCA && database.options.sslCert)
        database.options.sslCert = fs.readFileSync(database.options.sslCert);
});

Object.keys(config).forEach(function (key) {
    exports[key] = config[key];
});
