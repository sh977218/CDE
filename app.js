var path = require('path');

var express = require('express')
    , http = require('http')
    , flash = require('connect-flash')
    , mongo_data_system = require('./modules/system/node-js/mongo-data')
    , config = require('config')
    , session = require('express-session')
    , favicon = require('serve-favicon')
    , auth = require('./modules/system/node-js/authentication')
    , logging = require('./modules/system/node-js/logging.js')
    , daoManager = require('./modules/system/node-js/moduleDaoManager.js')
    , domain = require('domain').create()
    , ipfilter = require('express-ipfilter')
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , methodOverride = require('method-override')
    , morganLogger = require('morgan')
    , compress = require('compression')
    , helmet = require('helmet')

    ;

require('./modules/system/node-js/elastic').initEs();

require('log-buffer')(config.logBufferSize || 4096);

var app = express();

app.use(auth.ticketAuth);
app.use(compress());

var request = require('request');
app.use('/kibana/', function(req, res) {
    req.pipe(request('http://localhost:5601' + req.url)).on('error', function() {res.sendStatus(500);}).pipe(res);
});


process.on('uncaughtException', function (err) {
    console.log("ERROR1: " + err);
    console.log(err.stack);
    logging.errorLogger.error("Error: Uncaught Exception", {stack: err.stack, origin: "app.process.uncaughtException"});
});

domain.on('error', function(err){
    console.log("ERROR2: " + err);
    console.log(err.stack);
    logging.errorLogger.error("Error: Domain Error", {stack: err.stack, origin: "app.domain.error"});
});

var winstonStream = {
    write: function(message){
        logging.expressLogger.info(message);
    }
};

// all environments
app.set('port', config.port || 3000);
app.set('view engine', 'ejs');
app.set('trust proxy', true);

app.use(favicon(path.join(__dirname, './modules/cde/public/assets/img/favicon.ico')));//TODO: MOVE TO SYSTEM

app.use(bodyParser.urlencoded({ extended: false , limit: "5mb"}));
app.use(bodyParser.json({limit: "16mb"}));
app.use(methodOverride());
app.use(cookieParser());
app.use(helmet({
    frameguard: {
        action: 'deny'
    }
})); //So, there are a ton of app.js files in the project. Do I have to set the settings for all of them, or is there a place that can apply to them all?
var expressSettings = {
    secret: "Kfji76R"
    , proxy: config.proxy
    , resave: false
    , saveUninitialized: false
    , cookie: {httpOnly: true, secure: config.proxy}
};

var getRealIp = function(req) {
  if (req._remoteAddress) return req._remoteAddress;
  if (req.ip) return req.ip;
};

var blackIps = [];
var timedBlackIps = [];
app.use(ipfilter(blackIps, {errorMessage: "You are not authorized. Please contact support if you believe you should not see this error."}));
var banEndsWith = config.banEndsWith || [];
var banStartsWith = config.banStartsWith || [];

var releaseHackersFrequency = 3 * 60 * 1000;
setInterval(function releaseHackers () {
    blackIps.length = 0;
    timedBlackIps = timedBlackIps.filter(function (rec) {
        if ((Date.now() - rec.date) < releaseHackersFrequency) {
            blackIps.push(rec.ip);
            return rec;
        }
    });
}, releaseHackersFrequency);

app.use(function banHackers(req, res, next) {
    banEndsWith.forEach(function(ban) {
        if(req.originalUrl.slice(-(ban.length)) === ban) {
            blackIps.push(getRealIp(req));
            timedBlackIps.push({ip: getRealIp(req), date: Date.now()});
        }
    });
    banStartsWith.forEach(function(ban) {
        if(req.originalUrl.substr(0, ban.length) === ban) {
            blackIps.push(getRealIp(req));
            timedBlackIps.push({ip: getRealIp(req), date: Date.now()});
        }
    });
    next();
});    

app.use(function preventSessionCreation(req, res, next) {
    this.isFile = function(req) {
        if (req.originalUrl.substr(req.originalUrl.length-3,3) === ".js") return true;
        if (req.originalUrl.substr(req.originalUrl.length-4,4) === ".css") return true;
        return req.originalUrl.substr(req.originalUrl.length - 4, 4) === ".gif";

    };
    if ((req.cookies['connect.sid'] || req.originalUrl === "/login" || req.originalUrl === "/csrf") && !this.isFile(req)) {
        expressSettings.store = mongo_data_system.sessionStore;
        var initExpressSession = session(expressSettings);
        initExpressSession(req, res, next);
   } else {
       next();
   }

});

// this hack for angular-send-feedback
app.get("/icons.png", function(req, res) {
    res.sendFile(path.join(__dirname,'/modules/components/angular-send-feedback/dist/icons.png'));
});
app.use("/components", express.static(path.join(__dirname,'/modules/components')));
app.use("/modules/components", express.static(path.join(__dirname,'/modules/components')));
app.use("/cde/public", express.static(path.join(__dirname,'/modules/cde/public')));
app.use("/system/public", express.static(path.join(__dirname,'/modules/system/public')));

app.use("/form/public", express.static(path.join(__dirname,'/modules/form/public')));
app.use("/article/public", express.static(path.join(__dirname,'/modules/article/public')));

app.use(flash());
auth.init(app);

var logFormat = {remoteAddr: ":real-remote-addr", url: ":url", method: ":method", httpStatus: ":status",
    date: ":date", referrer: ":referrer", responseTime: ":response-time"};

morganLogger.token('real-remote-addr', function(req) {
    return getRealIp(req);
});

var expressLogger = morganLogger(JSON.stringify(logFormat), {stream: winstonStream});

var connections = 0;
setInterval(function() {
    connections = 0;
}, 60000);

app.use(function(req, res, next) {
    var maxLogsPerMinute = config.maxLogsPerMinute || 1000;
    connections++;
    if (connections > maxLogsPerMinute) {        
        return next();
    }
    expressLogger(req, res, next);    
});

app.set('views', path.join(__dirname, './modules'));

var originalRender = express.response.render;
express.response.render = function(view, module, msg) {
    if (!module) module = "cde";
    originalRender.call(this,  path.join(__dirname, '/modules/' + module + "/views/" + view), msg);
};

try {
    var cdeModule = require(path.join(__dirname, './modules/cde/node-js/app.js'));
    cdeModule.init(app, daoManager);

    var systemModule = require(path.join(__dirname, './modules/system/node-js/app.js'));
    systemModule.init(app, daoManager);

    var formModule = require(path.join(__dirname, './modules/form/node-js/app.js'));
    formModule.init(app, daoManager);

    var articleModule = require(path.join(__dirname, './modules/article/node-js/app.js'));
    articleModule.init(app);

    var batchModule = require(path.join(__dirname, './modules/batch/node-js/app.js'));
    batchModule.init(app);

} catch (e) {
    console.log(e.stack);
    process.exit();
}

app.use('/robots.txt', express.static(path.join(__dirname, '/modules/system/public/robots.txt')));

app.use(function(err, req, res, next){
    console.log("ERROR3: " + err);
    console.log(err.stack);
    if (req && req.body && req.body.password) req.body.password = "";
    var meta = {
        stack: err.stack
        , origin: "app.express.error"
        , request: {username: req.user?req.user.username:null, method: req.method, url: req.url, params: req.params, body: req.body, ip: req.ip, headers: {'user-agent': req.headers['user-agent']}}
    }; 
    logging.errorLogger.error('error', "Error: Express Default Error Handler", meta);
    if (err.status === 403) {
        res.status(403).send("Unauthorized");
    } else {
        res.status(500).send('Something broke!');
    }
    next();
});

domain.run(function(){
    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
});


