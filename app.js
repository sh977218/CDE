const path = require('path');
const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');
const flash = require('connect-flash');
const mongo_data_system = require('./server/system/mongo-data');
const config = require('config');
const session = require('express-session');
const favicon = require('serve-favicon');
const auth = require('./server/system/authentication');
const logging = require('./server/system/logging.js');
const daoManager = require('./server/system/moduleDaoManager.js');
const domain = require('domain').create();
const ipfilter = require('express-ipfilter');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const morganLogger = require('morgan');
const compress = require('compression');
const helmet = require('helmet');
const ioServer = require('./server/system/ioServer');
const winston = require('winston');

require('./server/system/elastic').initEs();

require('log-buffer')(config.logBufferSize || 4096);
console.log(process.versions.node);

var app = express();

app.use(helmet());
app.use(auth.ticketAuth);
app.use(compress());

app.use(require('hsts')({maxAge: 31536000000}));

var localRedirectProxy = httpProxy.createProxyServer({});

process.on('uncaughtException', function (err) {
    console.log("ERROR1: " + err);
    console.log(err.stack);
    logging.errorLogger.error("Error: Uncaught Exception", {stack: err.stack, origin: "app.process.uncaughtException"});
});

domain.on('error', function (err) {
    console.log("ERROR2: " + err);
    console.log(err.stack);
    logging.errorLogger.error("Error: Domain Error", {stack: err.stack, origin: "app.domain.error"});
});

// all environments
app.set('port', config.port || 3000);
app.set('view engine', 'ejs');
app.set('trust proxy', true);

app.use(favicon(path.join(__dirname, './modules/cde/public/assets/img/favicon.ico')));//TODO: MOVE TO SYSTEM

app.use(bodyParser.urlencoded({extended: false, limit: "5mb"}));
app.use(bodyParser.json({limit: "16mb"}));
app.use(methodOverride());
app.use(cookieParser());
var expressSettings = {
    store: mongo_data_system.sessionStore,
    secret: config.sessionKey,
    proxy: config.proxy,
    resave: false,
    saveUninitialized: false,
    cookie: {httpOnly: true, secure: config.proxy}
};

var getRealIp = function (req) {
    if (req._remoteAddress) return req._remoteAddress;
    if (req.ip) return req.ip;
};

var blackIps = [];
var timedBlackIps = [];
app.use(ipfilter(blackIps, {errorMessage: "You are not authorized. Please contact support if you believe you should not see this error."}));
var banEndsWith = config.banEndsWith || [];
var banStartsWith = config.banStartsWith || [];

var releaseHackersFrequency = 3 * 60 * 1000;
setInterval(function releaseHackers() {
    blackIps.length = 0;
    timedBlackIps = timedBlackIps.filter(function (rec) {
        if ((Date.now() - rec.date) < releaseHackersFrequency) {
            blackIps.push(rec.ip);
            return rec;
        }
    });
}, releaseHackersFrequency);

app.use(function checkHttps(req, res, next) {
    if (config.proxy) {
        if (req.protocol !== 'https') {
            if (req.query.gotohttps === "1")
                res.send("Missing X-Forward-Proto Header");
            else res.redirect(config.publicUrl + "?gotohttps=1");
        } else next();
    } else next();
});

app.use(function banHackers(req, res, next) {
    banEndsWith.forEach(function (ban) {
        if (req.originalUrl.slice(-(ban.length)) === ban) {
            blackIps.push(getRealIp(req));
            timedBlackIps.push({ip: getRealIp(req), date: Date.now()});
        }
    });
    banStartsWith.forEach(function (ban) {
        if (req.originalUrl.substr(0, ban.length) === ban) {
            blackIps.push(getRealIp(req));
            timedBlackIps.push({ip: getRealIp(req), date: Date.now()});
        }
    });
    next();
});

app.use(function preventSessionCreation(req, res, next) {
    this.isFile = function (req) {
        if (req.originalUrl.substr(req.originalUrl.length - 3, 3) === ".js") return true;
        if (req.originalUrl.substr(req.originalUrl.length - 4, 4) === ".css") return true;
        return req.originalUrl.substr(req.originalUrl.length - 4, 4) === ".gif";
    };
    if ((req.cookies['connect.sid'] || req.originalUrl === "/login" || req.originalUrl === "/csrf") && !this.isFile(req)) {
        var initExpressSession = session(expressSettings);
        initExpressSession(req, res, next);
    } else {
        next();
    }

});

app.use(function (req, res, next) {
    try {
        if (req.headers.host === "cde.nlm.nih.gov") {
            if (req.user && req.user.tester) {
                localRedirectProxy.web(req, res, {target: config.internalRules.redirectTo}, next);
            } else {
                return next();
            }
        } else {
            return next();
        }
    } catch (e) {
        return next();
    }
});

app.use("/cde/public", express.static(path.join(__dirname, '/modules/cde/public')));
app.use("/system/public", express.static(path.join(__dirname, '/modules/system/public')));
app.use("/swagger/public", express.static(path.join(__dirname, '/modules/swagger/public')));
app.use("/form/public", express.static(path.join(__dirname, '/modules/form/public')));

app.use("/app", express.static(path.join(__dirname, '/dist/app')));
app.use("/common", express.static(path.join(__dirname, '/dist/common')));
app.use("/components", express.static(path.join(__dirname, '/dist/components')));
app.use("/embed", express.static(path.join(__dirname, '/dist/embed')));
app.use("/native", express.static(path.join(__dirname, '/dist/native')));


["/embedded/public", "/_embedApp/public"].forEach(p => {
    app.use(p, (req, res, next) => {
            res.removeHeader("x-frame-options");
            next();
        },
        express.static(path.join(__dirname, '/modules/_embedApp/public'))
    );
});

app.use(flash());
auth.init(app);

var logFormat = {
    remoteAddr: ":real-remote-addr", url: ":url", method: ":method", httpStatus: ":status",
    date: ":date", referrer: ":referrer", responseTime: ":response-time"
};

morganLogger.token('real-remote-addr', function (req) {
    return getRealIp(req);
});

let winstonStream = {
    write: function (message) {
        logging.expressLogger.info(message);
    }
};

let expressLogger = morganLogger(JSON.stringify(logFormat), {stream: winstonStream});

if (config.expressLogFile) {
    const Rotate = require('winston-logrotate').Rotate;
    let logger = new (winston.Logger)({
        transports: [new Rotate({
            file: config.expressLogFile
        })]
    });
    let fileStream = {
        write: function (message) {
            logger.info(message);
        }
    };
    app.use(morganLogger(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ":response-time ms"', {stream: fileStream}));
}

var connections = 0;
setInterval(function () {
    connections = 0;
}, 60000);

app.use(function (req, res, next) {
    var maxLogsPerMinute = config.maxLogsPerMinute || 1000;
    connections++;
    if (connections > maxLogsPerMinute) {
        return next();
    } else
        expressLogger(req, res, next);
});

app.set('views', path.join(__dirname, './modules'));

var originalRender = express.response.render;
express.response.render = function (view, module, msg) {
    if (!module) module = "cde";
    originalRender.call(this, path.join(__dirname, '/modules/' + module + "/views/" + view), msg);
};

try {
    var cdeModule = require(path.join(__dirname, './server/cde/app.js'));
    cdeModule.init(app, daoManager);

    var systemModule = require(path.join(__dirname, './server/system/app.js'));
    systemModule.init(app, daoManager);

    var formModule = require(path.join(__dirname, './server/form/app.js'));
    formModule.init(app, daoManager);

    var boardModule = require(path.join(__dirname, './server/board/app.js'));
    boardModule.init(app, daoManager);

    var swaggerModule = require(path.join(__dirname, './modules/swagger/index.js'));
    swaggerModule.init(app);
} catch (e) {
    console.log(e.stack);
    process.exit();
}

app.use('/robots.txt', express.static(path.join(__dirname, '/modules/system/public/robots.txt')));


// final route -> 404
app.use((req, res, next) => {
    // swagger does something i don't get. This will let swagger work
    if (req.originalUrl === "/docs" || req.originalUrl === "/api-docs" || req.originalUrl.indexOf("/docs/") === 0) {
        return next();
    }
    res.render('index', 'system', {config: config, version: 'version'});
});


app.use(function (err, req, res, next) {
    console.log("ERROR3: " + err);
    console.log(err.stack);
    if (req && req.body && req.body.password) req.body.password = "";
    var meta = {
        stack: err.stack
        ,
        origin: "app.express.error"
        ,
        request: {
            username: req.user ? req.user.username : null,
            method: req.method,
            url: req.url,
            params: req.params,
            body: req.body,
            ip: req.ip,
            headers: {'user-agent': req.headers['user-agent']}
        }
    };
    logging.errorLogger.error('error', "Error: Express Default Error Handler", meta);
    if (err.status === 403) {
        res.status(403).send("Unauthorized");
    } else {
        res.status(500).send('Something broke!');
    }
    next();
});


var thisExports = exports;

domain.run(function () {
    var server = http.createServer(app);
    exports.server = server;
    server.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
    ioServer.startServer(server, expressSettings);
});


