var config = require('config');

config.database.log.uri = "mongodb://" + config.database.log.username + ":" + config.database.log.password + "@" +
config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + config.database.log.db;
config.mongoUri = "mongodb://" + config.database.appData.username + ":" + config.database.appData.password + "@" +
config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + config.database.appData.db;

config.mongoMigrationUri = "mongodb://" + config.database.migration.username + ":" + config.database.migration.password + "@" +
config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + "migration";
Object.keys(config).forEach(function (key) {
    exports[key] = config[key];
});
