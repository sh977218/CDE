var path = require('path');

require(path.join(__dirname, './deploy/configTest.js'));

var express = require('express')
  , http = require('http')
  , flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , mongo_data_system = require('./modules/system/node-js/mongo-data')
  , config = require('config')
  , MongoStore = require('./modules/cde/node-js/assets/connect-mongo.js')(express)//TODO: Remove this dependency!
  , favicon = require('serve-favicon')
  , auth = require( './modules/cde/node-js/authentication' )//TODO: Remove this dependency!
  , logging = require('./modules/system/node-js/logging.js')
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

passport.use(new LocalStrategy({passReqToCallback: true}, auth.authAfterVsac));
var app = express();

app.use(auth.ticketAuth);

process.on('uncaughtException', function (err) {
  logging.processLogger.error('Caught exception: ' + err.stack);
});

var winstonStream = {
    write: function(message, encoding){
        logging.expressLogger.info(message);
    }
};

// all environments
app.set('port', config.port || 3000);
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, './modules/cde/public/assets/img/favicon.ico')));//TODO: Remove this dependency!

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));

var sessionStore = new MongoStore({
    mongoose_connection: mongo_data_system.mongoose_connection  
});
app.use(function(req, res, next) {
    this.isFile = function(req) {
        if (req.originalUrl.substr(req.originalUrl.length-3,3) === ".js") return true;
        if (req.originalUrl.substr(req.originalUrl.length-4,4) === ".css") return true;
        if (req.originalUrl.substr(req.originalUrl.length-4,4) === ".gif") return true;
        return false;
    };
    if ((req.cookies['connect.sid'] || req.originalUrl === "/login") && !this.isFile(req)) {
        var initExpressSession = express.session({ secret: "omgnodeworks", proxy: true, store:sessionStore });
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
  logging.expressErrorLogger.error(JSON.stringify({msg: err.stack}));
  console.log(err.stack);
  res.send(500, 'Something broke!');
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
};

app.set('views', path.join(__dirname, './modules'));
var originalRender = express.response.render;
express.response.render = function(view, module) {
    if (!module) module = "cde";
    originalRender.call(this,  path.join(__dirname, '/modules/' + module + "/views/" + view));
};

var cdeModule = require(path.join(__dirname, './modules/cde/node-js/app.js'));
cdeModule.init(app);

console.log(path.join(__dirname, './modules/system/node-js/app.js'));

var systemModule = require(path.join(__dirname, './modules/system/node-js/app.js'));
systemModule.init(app);

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});