const config = require('config');

config.database.log.uri = "mongodb://" + config.database.log.username + ":" + config.database.log.password + "@" +
    config.database.servers.map(srv => srv.host + ":" + srv.port).join(",") + "/" + config.database.log.db;
config.database.appData.uri = "mongodb://" + config.database.appData.username + ":" + config.database.appData.password + "@" +
    config.database.servers.map(srv => srv.host + ":" + srv.port).join(",") + "/" + config.database.appData.db;

Object.keys(config).forEach(function (key) {
    exports[key] = config[key];
});
