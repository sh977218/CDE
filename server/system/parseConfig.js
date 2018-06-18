const config = require('config');

let databaseNames = ['log', 'appData'];

databaseNames.forEach(databaseName => {
    let database = config.database[databaseName];
    let username = database.username;
    let password = database.password;
    let hosts = config.database.servers.map(srv => srv.host + ":" + srv.port).join(",");
    let options = [];
    if (database.options && database.options.server && database.options.server.replicaSet)
        options.push('replicaSet=' + database.options.server.replset.rs_name);
    if (database.options && database.options.server && database.options.server.ssl)
        options.push('ssl=true');
    database.uri = "mongodb://" + username + ":" + password + "@" + hosts + "/" + database.db;
    if (options) database.uri = database.uri + '?' + options.join('&');
});

Object.keys(config).forEach(function (key) {
    exports[key] = config[key];
});
