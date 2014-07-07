var config = {
	name: "Sample Localhost Configuration"
    , umls: {
        licenseCode: "NLM-4110134256"
    }
    , internalIP: "130.14."
    , vsac: {
        username: 'user'
        , password: 'pass'
        , host: 'vsac-qa.nlm.nih.gov'
        , ticket: {
            path: '/vsac/ws/Ticket'
        }
        , valueSet: {
            path: '/vsac/ws/RetrieveValueSet'
        }
        , port: 4000
    }
    , logdir: ''
    , port: 3001
    , elastic: {
        uri: "http://localhost:9200"
        , index: {name: "cdetest"}
        , river: {name: "cdetest"}
    }
    , database: {
        servers: [
            { host: "localhost", port: 27017 }
        ]
        , dbname: "test"
        , log: {
            uri: "mongodb://localhost/cde-logs-test"
        }
    }
    , node: {
        scripts: {
            stop: ""
            , start: "node ../run/node-js/app &"            
        }
        , buildDir: "../build"
    }
};

module.exports = config;
module.exports.elasticUri = config.elastic.uri + "/" + config.elastic.index.name + "/" ;
module.exports.elasticRiverUri = config.elastic.uri + "/_river/" + config.elastic.index.name + "/_meta" ;
module.exports.mongoUri = config.database.servers.map(function(srv) {
    return "mongodb://" + srv.host + ":" + srv.port + "/" + config.database.dbname;
});







