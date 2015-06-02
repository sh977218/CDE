
config.database.log.uri = "mongodb://localhost/" + config.database.log.dbname

module.exports = config;
module.exports.mongoUri = "mongodb://" + config.database.servers.map(function(srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + config.database.dbname;
module.exports.elasticUri = config.elastic.uri + "/" + config.elastic.index.name + "/";
module.exports.elasticRiverUri = config.elastic.uri + "/_river/" + config.elastic.index.name;
module.exports.elasticFormUri = config.elastic.uri + "/" + config.elastic.formIndex.name + "/";
module.exports.elasticFormRiverUri = config.elastic.uri + "/_river/" + config.elastic.formIndex.name;
module.exports.elasticStoredQueryUri = config.elastic.uri + "/" + config.elastic.storedQueryIndex.name + "/";
module.exports.elasticStoredQueryRiverUri = config.elastic.uri + "/_river/" + config.elastic.storedQueryIndex.name;

module.exports.occsNonPrimaryReplicas = ["130.14.164.22:27017", "130.14.164.21:27017"];
module.exports.nccsReplicas = ["165.112.35.20:27017", "165.112.35.21:27017"];

module.exports.nccsPrimaryRepl = 
{
    "_id" : "rs0",
    "members" : [
        {
                "_id" : 0,
                "host" : "130.14.164.20:27017",
                "priority" : 5
        },
        {
                "_id" : 2,
                "host" : "165.112.35.20:27017"
        },
        {
                "_id" : 3,
                "host" : "165.112.35.21:27017"
        }
    ]
};

module.exports.occsPrimaryRepl = 
{
    "_id" : "rs0",
    "members" : [
        {
                "_id" : 0,
                "host" : "130.14.164.20:27017",
                "priority" : 5
        },
        {
                "_id" : 1,
                "host" : "130.14.164.21:27017",
                "priority" : 5
        },
        {
                "_id" : 2,
                "host" : "165.112.35.20:27017"
        },
        {
                "_id" : 3,
                "host" : "165.112.35.21:27017"
        },
        {
                "_id" : 4,
                "host" : "130.14.164.22:27017",
                "priority" : 5
        }
    ]
};


module.exports.mongoMigrationUri = "mongodb://" + config.database.servers.map(function(srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + "migration";

