var path = require('path');

require(path.join(__dirname, './deploy/configTest.js'));

var express = require('express')
  , http = require('http')
  , flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , mongo_data_system = require('./modules/system/node-js/mongo-data')
  , config = require('config')
  , MongoStore = require('./modules/system/node-js/assets/connect-mongo.js')(express)
  , favicon = require('serve-favicon')
  , auth = require( './modules/system/node-js/authentication' )//TODO: MOVE TO SYSTEM
  , logging = require('./modules/system/node-js/logging.js')
  , daoManager = require('./modules/system/node-js/moduleDaoManager.js')
  , domain = require('domain').create()
;

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    mongo_data_system.userById(id, function(err, user){
        console.log("user: " + user.username + " " + user.orgAdmin);  
        done(err, user);
    });
});

passport.use(new LocalStrategy({passReqToCallback: true}, auth.authBeforeVsac));
var app = express();

app.use(auth.ticketAuth);

process.on('uncaughtException', function (err) {
  logging.processLogger.error('Caught exception: ' + err.stack);
});

domain.on('error', function(err){
    console.log(err); 
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

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser("Jk87fhK"));

var sessionStore = new MongoStore({
    mongoose_connection: mongo_data_system.mongoose_connection  
});

var expressSettings = {
    secret: "Kfji76R"
//    , store: sessionStore
    , proxy: config.proxy
    , cookie: {httpOnly: true, secure: config.proxy}
};

app.use(function(req, res, next) {
    this.isFile = function(req) {
        if (req.originalUrl.substr(req.originalUrl.length-3,3) === ".js") return true;
        if (req.originalUrl.substr(req.originalUrl.length-4,4) === ".css") return true;
        if (req.originalUrl.substr(req.originalUrl.length-4,4) === ".gif") return true;
        return false;
    };
    if ((req.cookies['connect.sid'] || req.originalUrl === "/login") && !this.isFile(req)) {
        var initExpressSession = express.session(expressSettings);
        initExpressSession(req, res, next);
   } else {
       next();
   }
});

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

var logFormat = {remoteAddr: ":remote-addr", url: ":url", method: ":method", httpStatus: ":status", date: ":date", referrer: ":referrer"};

app.use(express.logger({format: JSON.stringify(logFormat), stream: winstonStream}));

app.use(app.router);

app.use(function(err, req, res, next){
    var str = JSON.stringify({msg: err.stack});
    logging.expressErrorLogger.error(str);
    console.log(err.stack);
    if (err.status === 403) {
        res.send(403, "Unauthorized");
    } else {
        res.send(500, 'Something broke!');
    }
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
} catch (e) {
    console.log(e.stack);
    process.exit();
}





domain.run(function(){
    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
});