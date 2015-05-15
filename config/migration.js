var config = {
    name: "Sample Localhost Configuration"
    , umls: {
        licenseCode: "NLM-4110134256"
    }
    , internalIP: "130.14."
    , vsac: {
        username: 'user'
        , password: 'pass'
        , host: 'localhost'
        , ticket: {
            path: '/vsac/ws/Ticket'
        }
        , valueSet: {
            path: '/vsac/ws/RetrieveValueSet'
        }
        , port: 4000
    }
    , logdir: '../logs'
    , port: 3002
    , elastic: {
        uri: "http://localhost:9200"
        , index: {name: "migration"}
        , river: {name: "migration"}
        , formIndex: {name: "migrationf"}
        , formRiver: {name: "migrationf"}
        , scripts: {
            stop: "echo stop"
            , start: "echo start"
        }           
    }
    , database: {
        servers: [
            { host: "localhost", port: 27017 }
        ]
        , dbname: "migration"
        , log: {uri: "mongodb://localhost/cde-logs-test", cappedCollectionSizeMB: 1024*1024*250}
        , local: {uri: "mongodb://localhost/local"}
    }
    , uts: {
        service: 'http://umlsks.nlm.nih.gov' // Identifier of the service for which the ticket was issued.
        , ticketValidation: {
            host: 'localhost'
            , path: '/cas/serviceValidate'
            , port: 4000
        }
    }    
    , node: {
        scripts: {
            stop: ""
            , start: "node ../run/node-js/app &"            
        }
        , buildDir: "../build"
    }
    , modules: {
        forms: {
            attachments: true
            , comments: true
            , highlight: true
            , audit: false
            , sectionLevels: 10
            , localRender: true
            , loincRenderUrl: "https://lforms.nlm.nih.gov/#/preview/nlmcde/"
        } 
        , article: true
        , cde: {
            attachments: true
            , comments: true
            , highlight: true
            , audit: true
            , tableView: true
            , eltExport: true
        }        
    }
    , admins: [{
        name: "Jakub Flaska"
        , email: "jakub.flaska@nih.gov"
    }]
    , status: {
        timeouts: {
            statusCheck: 10000*5 
            , dummyElementCheck: 10000*2 
            , emailSendPeriod: 10000*60*2 
            , minUptime: 5000
            , clusterStatus: 10000
        }    
    }
    , account: 'CDE Account <cdeuser@nlm.nih.gov>'
    , maxLogsPerMinute: 10
    , expressToStdout: true
    , logBufferSize: 2
    , viewsIncrementThreshold: 2
    , antivirus: {
        ip: "127.0.0.1"
        , port: 3311
    }
    , pm: {
    }
    //, classificationLevels: 30
};


module.exports = config;

module.exports.mongoUri = config.database.servers.map(function(srv) {
    return "mongodb://" + srv.host + ":" + srv.port + "/" + config.database.dbname;
});

module.exports.elasticUri = config.elastic.uri + "/" + config.elastic.index.name + "/";
module.exports.elasticRiverUri = config.elastic.uri + "/_river/" + config.elastic.index.name;
module.exports.elasticFormUri = config.elastic.uri + "/" + config.elastic.formIndex.name + "/";
module.exports.elasticFormRiverUri = config.elastic.uri + "/_river/" + config.elastic.formIndex.name;

module.exports.mongoMigrationUri = "mongodb://" + config.database.servers.map(function(srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + "migration";

console.log(module.exports.mongoMigrationUri);




