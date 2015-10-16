var config = require('config')
    , hash = require("crypto").createHash('md5')
    , esInit = require('../../../deploy/elasticSearchInit')
;

config.database.log.uri = "mongodb://" + config.database.dbUser + ":" + config.database.dbPassword + "@" +
    config.database.servers.map(function (srv) {
        return srv.host + ":" + srv.port;
    }).join(",") + "/" + config.database.log.dbname;
config.database.local.uri = "mongodb://" + config.database.dbUser + ":" + config.database.dbPassword + "@" +
    config.database.servers.map(function (srv) {
        return srv.host + ":" + srv.port;
    }).join(",") + "/" + config.database.local.dbname;
config.mongoUri = "mongodb://" + config.database.dbUser + ":" + config.database.dbPassword + "@" +
    config.database.servers.map(function (srv) {
        return srv.host + ":" + srv.port;
    }).join(",") + "/" + config.database.dbname;

if (config.elastic.index.name === "auto") {
    // genarate index name
    config.elastic.index.name = "cde_" + hash.update(JSON.stringify(esInit.createIndexJson)).digest("hex")
            .substr(0, 5).toLowerCase();
}


// TODO Remove these
config.elasticUri = config.elastic.hosts[0] + "/" + config.elastic.index.name + "/";
config.elasticRiverUri = config.elastic.hosts[0] + "/_river/" + config.elastic.index.name;
config.elasticFormUri = config.elastic.hosts[0] + "/" + config.elastic.formIndex.name + "/";
config.elasticFormRiverUri = config.elastic.hosts[0] + "/_river/" + config.elastic.formIndex.name;
config.elasticBoardIndexUri = config.elastic.hosts[0] + "/" + config.elastic.boardIndex.name + "/";
config.elasticBoardRiverUri = config.elastic.hosts[0] + "/_river/" + config.elastic.boardIndex.name;
config.elasticStoredQueryUri = config.elastic.hosts[0] + "/" + config.elastic.storedQueryIndex.name + "/";
config.elasticStoredQueryRiverUri = config.elastic.hosts[0] + "/_river/" + config.elastic.storedQueryIndex.name;

config.mongoMigrationUri = "mongodb://" + config.database.dbUser + ":" + config.database.dbPassword + "@" +
    config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + "migration";
Object.keys(config).forEach(function (key) {
    exports[key] = config[key];
});
