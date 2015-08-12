var path = require('path');

require(path.join(__dirname, './deploy/configTest.js'));

var express = require('express')
  , http = require('http')
  , flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , mongo_data_system = require('./modules/system/node-js/mongo-data')
  , config = require('config')
  , session = require('express-session')
  , favicon = require('serve-favicon')
  , auth = require( './modules/system/node-js/authentication' )
  , logging = require('./modules/system/node-js/logging.js')
  , daoManager = require('./modules/system/node-js/moduleDaoManager.js')
  , domain = require('domain').create()
  , ipfilter = require('express-ipfilter')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , methodOverride = require('method-override')
  , morganLogger = require('morgan')
    , async = require('async')
    ;


require('log-buffer')(config.logBufferSize || 4096);

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    mongo_data_system.userById(id, function(err, user){
        done(err, user);
    });
});

passport.use(new LocalStrategy({passReqToCallback: true}, auth.authBeforeVsac));
var app = express();

app.use(auth.ticketAuth);

var request = require('request');
app.use('/kibana/', function(req, res, next) {
    req.pipe(request('http://localhost:5601' + req.url)).on('error', function(err) {res.sendStatus(500)}).pipe(res);
});


process.on('uncaughtException', function (err) {
    console.log("ERROR1: " + err);
    logging.errorLogger.error("Error: Uncaught Exception", {stack: err.stack, origin: "app.process.uncaughtException"});
});

domain.on('error', function(err){
    console.log("ERROR2: " + err);
    logging.errorLogger.error("Error: Domain Error", {stack: err.stack, origin: "app.domain.error"});
});

var winstonStream = {
    write: function(message, encoding){
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
app.use(ipfilter(blackIps));
var banEndsWith = config.banEndsWith || [];
var banStartsWith = config.banStartsWith || [];

app.use(function banHackers(req, res, next) {
    banEndsWith.forEach(function(ban) {
        if(req.originalUrl.slice(-(ban.length))  === ban) {
            blackIps.push(getRealIp(req));
        }
    });
    banStartsWith.forEach(function(ban) {
        if(req.originalUrl.substr(0, ban.length) === ban) {
            blackIps.push(getRealIp(req));
        }
    });
    next();
});    

app.use(function preventSessionCreation(req, res, next) {
    this.isFile = function(req) {
        if (req.originalUrl.substr(req.originalUrl.length-3,3) === ".js") return true;
        if (req.originalUrl.substr(req.originalUrl.length-4,4) === ".css") return true;
        if (req.originalUrl.substr(req.originalUrl.length-4,4) === ".gif") return true;
        return false;
    };
    if ((req.cookies['connect.sid'] || req.originalUrl === "/login" || req.originalUrl === "/csrf") && !this.isFile(req)) {
        expressSettings.store = mongo_data_system.sessionStore;
        var initExpressSession = session(expressSettings);
        initExpressSession(req, res, next);
   } else {
       next();
   }

});

app.use("/cde/public", express.static(path.join(__dirname,'/modules/cde/public')));
app.use("/system/public", express.static(path.join(__dirname,'/modules/system/public')));

app.use("/form/public", express.static(path.join(__dirname,'/modules/form/public')));
app.use("/article/public", express.static(path.join(__dirname,'/modules/article/public')));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

var logFormat = {remoteAddr: ":real-remote-addr", url: ":url", method: ":method", httpStatus: ":status", date: ":date", referrer: ":referrer"};

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
        next();
        return;
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
    articleModule.init(app, daoManager);
} catch (e) {
    console.log(e.stack);
    process.exit();
}

app.get('/robots.txt', function(){
    res.sendFile('robots.txt');
});

app.use(function(err, req, res, next){
    console.log("ERROR3: " + err);
    if (req && req.body && req.body.password) req.body.password = "";
    var meta = {
        stack: err.stack
        , origin: "app.express.error"
        , request: {username: req.user?req.user.username:null, method: req.method, url: req.url, params: req.params, body: req.body}
    }; 
    logging.errorLogger.error("Error: Express Default Error Handler", meta);
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


