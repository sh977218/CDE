var config = require('config')
    , hash = require("crypto")
    , esInit = require('../../../deploy/elasticSearchInit')
    ;

config.database.log.uri = "mongodb://" + config.database.log.dbUser + ":" + config.database.log.dbPassword + "@" +
config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + config.database.log.dbname;
config.database.local.uri = "mongodb://" + config.database.admin.dbUser + ":" + config.database.admin.dbPassword + "@" +
config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + config.database.local.dbname;
config.mongoUri = "mongodb://" + config.database.nlmcde.dbUser + ":" + config.database.nlmcde.dbPassword + "@" +
config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + config.database.dbname;

var shortHash = function (content) {
    return hash.createHash('md5')
        .update(JSON.stringify(content)).digest("hex")
        .substr(0, 5).toLowerCase();
};

if (config.elastic.index.name === "auto") {
    config.elastic.index.name = "cde_" + shortHash(esInit.createIndexJson);
}
if (config.elastic.formIndex.name === "auto") {
    config.elastic.formIndex.name = "form_" + shortHash(esInit.createFormIndexJson);
}
if (config.elastic.boardIndex.name === "auto") {
    config.elastic.boardIndex.name = "board_" + shortHash(esInit.createBoardIndexJson);
}
if (config.elastic.storedQueryIndex.name === "auto") {
    config.elastic.storedQueryIndex.name = "sq_" + shortHash(esInit.createStoredQueryIndexJson);
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

config.mongoMigrationUri = "mongodb://" + config.database.nlmcde.dbUser + ":" + config.database.nlmcde.dbPassword + "@" +
config.database.servers.map(function (srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + "migration";
Object.keys(config).forEach(function (key) {
    exports[key] = config[key];
});
