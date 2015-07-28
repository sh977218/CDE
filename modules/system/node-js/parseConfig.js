var config = require('config');
config.database.log.uri = "mongodb://" + config.database.dbUser + ":" + config.database.dbPassword + "@" + config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + config.database.log.dbname;
config.database.local.uri = "mongodb://" + config.database.dbUser + ":" + config.database.dbPassword + "@" + config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + config.database.local.dbname;
config.mongoUri = "mongodb://" + config.database.dbUser + ":" + config.database.dbPassword + "@" + config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + config.database.dbname;
config.elasticUri = config.elastic.uri + "/" + config.elastic.index.name + "/";
config.elasticRiverUri = config.elastic.uri + "/_river/" + config.elastic.index.name;
config.elasticFormUri = config.elastic.uri + "/" + config.elastic.formIndex.name + "/";
config.elasticFormRiverUri = config.elastic.uri + "/_river/" + config.elastic.formIndex.name;
config.elasticStoredQueryUri = config.elastic.uri + "/" + config.elastic.storedQueryIndex.name + "/";
config.elasticStoredQueryRiverUri = config.elastic.uri + "/_river/" + config.elastic.storedQueryIndex.name;
config.mongoMigrationUri = "mongodb://" + config.database.dbUser + ":" + config.database.dbPassword + "@" + config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + "migration";
Object.keys(config).forEach(function (key) {
    exports[key] = config[key];
});

config.modules.forms.editable = false;
