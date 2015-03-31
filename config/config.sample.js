var config = {
	name: "Sample Localhost Configuration"
    , hostname: "localhost"
    , umls: {
        licenseCode: "NLM-4110134256"
    }
    , internalIP: "130.14."
    , banEndsWith: [".php", ".cfm", ".jsp", ".asp", ".do", ".aspx"]
    , banStartsWith: ["/admin/", "/cgi-bin"]
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
    , uts: {
        service: 'http://umlsks.nlm.nih.gov' // Identifier of the service for which the ticket was issued.
        , ticketValidation: {
            host: 'utslogin.nlm.nih.gov'
            , path: '/cas/serviceValidate'
            , port: 443
        }
    }
    , logdir: ''
    , port: 3001
    , elastic: {
        uri: "http://localhost:9200"
        , index: {name: "cdetest"}
        , river: {name: "cdetest"}
        , formIndex: {name: "formtest"}
        , formRiver: {name: "formtest"} 
        , scripts: {
            stop: "sudo /sbin/service elasticsearch stop"
            , start: "sudo /sbin/service elasticsearch start"
        }          
    }
    , database: {
        servers: [
            { host: "localhost", port: 27017 }
        ]
        , dbname: "test"
        , log: {
            uri: "mongodb://localhost/cde-logs-test"
            , cappedCollectionSizeMB: 1024*1024*250
        }, local: {
            uri: "mongodb://localhost/local"
        }
    }
    , node: {
        scripts: {
            stop: ""
            , start: "node ../run/node-js/app &"            
        }
        , buildDir: "../build"
    }
    , test: {
        forkNb: 12
        , timeout: 8
        , browser: 'chrome'
        , testsToRun: '--tests gov.nih.nlm.cde.test.*'
    }
    , modules: {
        forms: {
            attachments: true
            , comments: true          
        }
        , article: true
        , cde: {
            attachments: true
            , comments: true
            , highlight: true
            , audit: true
        }
    } 
    , status: {
        timeouts: { 
            statusCheck: 1000*60*2 // How often to update /status/cde page ? (miliseconds)
            , dummyElementCheck: 1000*30 // How long should we wait for a dummy element created in MongoDB to also appear in ElasticSearch? (miliseconds)
            , emailSendPeriod: 1000*60*60*4 // How long should we wait after an email with a negative status report before we send another one? (miliseconds)
            , minUptime: 60*5 // How long should we wait after starting the app before we send a first negative email? (seconds!)
            , clusterStatus: 30 // How often to update your status in DB (seconds)
        }    
    }
    , account: 'CDE Account <cdeuser@nlm.nih.gov>'    
    , maxLogsPerMinute: 1000
    , expressToStdout: false
    , logBufferSize: 1000
    , viewsIncrementTreshold: 3
    , antivirus: {
        ip: "127.0.0.1"
        , port: 3311
    }
    , pm: {
        port: 3081
        , nodeProcess: "path to node bin, if needed"
    }
};

module.exports = config;
module.exports.mongoUri = "mongodb://" + config.database.servers.map(function(srv) {
    return srv.host + ":" + srv.port;
}).join(",") + "/" + config.database.dbname;
module.exports.elasticUri = config.elastic.uri + "/" + config.elastic.index.name + "/";
module.exports.elasticRiverUri = config.elastic.uri + "/_river/" + config.elastic.index.name;
module.exports.elasticFormUri = config.elastic.uri + "/" + config.elastic.formIndex.name + "/";
module.exports.elasticFormRiverUri = config.elastic.uri + "/_river/" + config.elastic.formIndex.name;

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



