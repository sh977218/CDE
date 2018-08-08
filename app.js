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
const ipFilter = require('express-ipfilter').IpFilter;
const IpDeniedError = require('express-ipfilter').IpDeniedError;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const morganLogger = require('morgan');
const compress = require('compression');
const helmet = require('helmet');
const ioServer = require('./server/system/ioServer');
const winston = require('winston');
const authorization = require('./server/system/authorization');
const traffic = require('./server/system/traffic');

require('./server/system/elastic').initEs();

require('log-buffer')(config.logBufferSize || 4096);
console.log(process.versions.node);

let app = express();

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'", 'fonts.gstatic.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com', "*.nih.gov"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.ckeditor.com", "cdn.jsdelivr.net",
            "cdnjs.cloudflare.com", "*.nih.gov", "ajax.googleapis.com", "www.googletagmanager.com", "www.google-analytics.com"],
        styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com', 'fonts.googleapis.com', 'fonts.gstatic.com',
            "'unsafe-inline'", "*.nih.gov", "cdn.ckeditor.com"],
        imgSrc: ["'self'", 'data:', "cdn.ckeditor.com", "*.nih.gov", "www.google-analytics.com"],
        connectSrc: ['*'],
        reportUri: "https://nlmoccs.report-uri.com/r/d/csp/reportOnly",
        workerSrc: ['*']
    }
}));
app.use(helmet.referrerPolicy({policy: 'same-origin'}));
app.use(auth.ticketAuth);
app.use(compress());

app.use(require('hsts')({maxAge: 31536000000}));

let localRedirectProxy = httpProxy.createProxyServer({});

process.on('uncaughtException', function (err) {
    console.log("Error: Process Uncaught Exception");
    console.log(err.stack);
    logging.errorLogger.error("Error: Uncaught Exception", {stack: err.stack, origin: "app.process.uncaughtException"});
});

domain.on('error', function (err) {
    console.log("Error: Domain Error");
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
const expressSettings = {
    store: mongo_data_system.sessionStore,
    secret: config.sessionKey,
    proxy: config.proxy,
    resave: false,
    saveUninitialized: false,
    cookie: {httpOnly: true, secure: config.proxy}
};

let getRealIp = function (req) {
    if (req._remoteAddress) return req._remoteAddress;
    if (req.ip) return req.ip;
};

let blackIps = [];
app.use(ipFilter(() => blackIps, {errorMessage: ""}));
const banEndsWith = config.banEndsWith || [];
const banStartsWith = config.banStartsWith || [];

const releaseHackersFrequency = 5 * 60 * 1000;
const keepHackerForDuration = 1000 * 60 * 60 * 24;
// every minute, get latest list.
setInterval(() => {
    traffic.getTrafficFilter(record => {
        blackIps.length = 0;
        // release IPs, but keep track for a day
        record.ipList = record.ipList.filter(ipElt => ((Date.now() - ipElt.date) < (keepHackerForDuration * ipElt.strikes)));
        record.save();
        blackIps = record.ipList.filter(ipElt => ((Date.now() - ipElt.date) < releaseHackersFrequency * ipElt.strikes)).map(r => r.ip);
    });
}, 60 * 1000);


// check https
app.use((req, res, next) => {
    if (config.proxy && req.originalUrl !== "/status/cde") {
        if (req.protocol !== 'https') {
            if (req.query.gotohttps === "1")
                res.send("Missing X-Forward-Proto Header");
            else res.redirect(config.publicUrl + "?gotohttps=1");
        } else next();
    } else next();
});

app.use(function banHackers(req, res, next) {
    banEndsWith.forEach(ban => {
        if (req.originalUrl.slice(-(ban.length)) === ban) {
            let ip = getRealIp(req);
            traffic.banIp(ip, req.originalUrl);
            blackIps.push(ip);
        }
    });
    banStartsWith.forEach(ban => {
        if (req.originalUrl.substr(0, ban.length) === ban) {
            let ip = getRealIp(req);
            traffic.banIp(ip, req.originalUrl);
            blackIps.push(ip);
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
        session(expressSettings)(req, res, next);
    } else next();

});

app.use("/cde/public", express.static(path.join(__dirname, '/modules/cde/public')));
app.use("/system/public", express.static(path.join(__dirname, '/modules/system/public')));
app.use("/swagger/public", express.static(path.join(__dirname, '/modules/swagger/public')));
app.use("/form/public", express.static(path.join(__dirname, '/modules/form/public')));

app.use("/app", express.static(path.join(__dirname, '/dist/app')));
app.use("/app/offline", express.static(path.join(__dirname, '/dist/app/offline')));
app.use("/common", express.static(path.join(__dirname, '/dist/common')));
app.use("/components", express.static(path.join(__dirname, '/dist/components')));
app.use("/embed", express.static(path.join(__dirname, '/dist/embed')));
app.use("/launch", express.static(path.join(__dirname, '/dist/launch')));
app.use("/native", express.static(path.join(__dirname, '/dist/native')));
app.use("/fhir", express.static(path.join(__dirname, '/dist/fhir')));

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

const logFormat = {
    remoteAddr: ":real-remote-addr",
    url: ":url",
    method: ":method",
    httpStatus: ":status",
    date: ":date",
    referrer: ":referrer",
    responseTime: ":response-time"
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

let connections = 0;
setInterval(() => connections = 0, 60000);

app.use(function (req, res, next) {
    let maxLogsPerMinute = config.maxLogsPerMinute || 1000;
    connections++;
    if (connections > maxLogsPerMinute) return next();
    else expressLogger(req, res, next);
});

app.set('views', path.join(__dirname, './modules'));

let originalRender = express.response.render;
express.response.render = function (view, module, msg) {
    if (!module) module = "cde";
    originalRender.call(this, path.join(__dirname, '/modules/' + module + "/views/" + view), msg);
};

try {
    let discussModule = require("./server/discuss/discussRoutes").module({
        allComments: [authorization.isOrgAuthorityMiddleware],
        manageComment: [authorization.canApproveCommentMiddleware]
    });
    app.use('/server/discuss', discussModule);

    let logModule = require("./server/log/logRoutes").module({
        feedbackLog: [authorization.isOrgAuthorityMiddleware],
        superLog: [authorization.isSiteAdminMiddleware]
    });
    app.use('/server/log', logModule);

    require(path.join(__dirname, './server/cde/app.js')).init(app, daoManager);

    require(path.join(__dirname, './server/system/app.js')).init(app, daoManager);

    require(path.join(__dirname, './server/form/app.js')).init(app, daoManager);

    require(path.join(__dirname, './server/board/app.js')).init(app, daoManager);

    require(path.join(__dirname, './modules/swagger/index.js')).init(app);

    let userModule = require("./server/user/userRoutes").module({
        search: [authorization.isOrgAdminMiddleware],
        manage: [authorization.isOrgAuthorityMiddleware],
        notificationDate:[authorization.isSiteAdminMiddleware]
    });
    app.use('/server/user', userModule);

    let notificationModule = require("./server/notification/notificationRoutes").module({});
    app.use('/server/notification', authorization.loggedInMiddleware, notificationModule);

    let articleModule = require("./server/article/articleRoutes").module({
        update: [authorization.isSiteAdminMiddleware],
    });
    app.use('/server/article', articleModule);

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


app.use((err, req, res, next) => {

    if (err instanceof IpDeniedError) {
        return res.status(403).send("You are not authorized. Please contact support if you believe you should not see this error.");
    }

    console.log("ERROR3: " + err);
    console.log(err.stack);
    if (req && req.body && req.body.password) req.body.password = "";
    let meta = {
        stack: err.stack,
        origin: "app.express.error",
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

domain.run(() => {
    let server = http.createServer(app);
    exports.server = server;
    server.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + app.get('port'));
    });
    ioServer.startServer(server, expressSettings);
});


