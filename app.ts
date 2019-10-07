(global as any).APP_DIR = __dirname;
(global as any).appDir = function addDir(...args: string[]) {
    return path.resolve((global as any).APP_DIR, ...args);
};
import * as bodyParser from 'body-parser';
import * as compress from 'compression';
import * as Config from 'config';
import * as flash from 'connect-flash';
import * as cookieParser from 'cookie-parser';
import * as Domain from 'domain';
import * as express from 'express';
import * as session from 'express-session';
import * as httpProxy from 'express-http-proxy';
import * as helmet from 'helmet';
import * as hsts from 'hsts';
import * as http from 'http';
import * as methodOverride from 'method-override';
import * as morganLogger from 'morgan';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as winston from 'winston';
import { Rotate } from 'winston-logrotate';
import { init as swaggerInit } from './modules/swagger/index';
import * as articleDb from 'server/article/articleDb';
import { module as articleModule } from 'server/article/articleRoutes';
import { module as attachmentModule } from 'server/attachment/attachmentRoutes';
import { module as boardModule } from 'server/board/boardRoutes';
import { init as cdeInit } from 'server/cde/app';
import * as mongo_cde from 'server/cde/mongo-cde';
import { module as classificationModule } from 'server/classification/classificationRoutes';
import { module as discussModule } from 'server/discuss/discussRoutes';
import { module as logModule } from 'server/log/logRoutes';
import { init as formInit } from 'server/form/app';
import * as mongo_form from 'server/form/mongo-form';
import { module as meshModule } from 'server/mesh/meshRoutes';
import { module as siteAdminModule } from 'server/siteAdmin/siteAdminRoutes';
import { module as notificationModule } from 'server/notification/notificationRouters';
import { module as nativeRenderModule } from 'server/nativeRender/nativeRenderRouters';
import { module as embedModule } from 'server/embed/embedRouters';
import { module as fhirModule } from 'server/fhir/fhirRouters';
import { init as systemInit, respondHomeFull } from 'server/system/app';
import { init as authInit, ticketAuth } from 'server/system/authentication';
import {
    canApproveAttachmentMiddleware, canApproveCommentMiddleware, checkOwnership, isDocumentationEditor,
    isOrgAdminMiddleware, isOrgAuthorityMiddleware, isSiteAdminMiddleware, loggedInMiddleware
} from 'server/system/authorization';
import { initEs } from 'server/system/elastic';
import { startServer } from 'server/system/ioServer';
import { errorLogger, expressLogger } from 'server/system/logging';
import * as daoManager from 'server/system/moduleDaoManager';
import { sessionStore } from 'server/system/mongo-data';
import { banIp, getTrafficFilter } from 'server/system/trafficFilterSvc';
import { module as userModule } from 'server/user/userRoutes';
import { module as utsModule } from 'server/uts/utsRoutes';
import { isOrgAuthority, isOrgCurator } from 'shared/system/authorizationShared';

const config = Config as any;
const domain = Domain.create();


initEs();

console.log('Node ' + process.versions.node);
console.log('Node Environment ' + process.env.NODE_ENV);

const app = express();

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'", 'fonts.gstatic.com'],
        fontSrc: ["'self'", 'fonts.gstatic.com', '*.nih.gov'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'cdn.ckeditor.com', 'cdn.jsdelivr.net',
            'cdnjs.cloudflare.com', '*.nih.gov', 'ajax.googleapis.com', 'www.googletagmanager.com', 'www.google-analytics.com'],
        styleSrc: ["'self'", 'maxcdn.bootstrapcdn.com', 'fonts.googleapis.com', 'fonts.gstatic.com',
            "'unsafe-inline'", '*.nih.gov', 'cdn.ckeditor.com'],
        imgSrc: ["'self'", 'data:', 'cdn.ckeditor.com', '*.nih.gov', 'www.google-analytics.com'],
        connectSrc: ['*'],
        reportUri: 'https://nlmoccs.report-uri.com/r/d/csp/reportOnly',
        workerSrc: ['*']
    }
}));
app.use(helmet.referrerPolicy({policy: 'same-origin'}));
app.use(ticketAuth);
app.use(compress());

app.use(hsts({maxAge: 31536000000}));

process.on('uncaughtException', (err) => {
    console.log('Error: Process Uncaught Exception');
    console.log(err.stack || err);
    errorLogger.error('Error: Uncaught Exception', {
        stack: err.stack || err,
        origin: 'app.process.uncaughtException'
    });
});

domain.on('error', (err) => {
    console.log('Error: Domain Error');
    console.log(err.stack || err);
    errorLogger.error('Error: Domain Error', {stack: err.stack || err, origin: 'app.domain.error'});
});

// all environments
app.set('port', config.port || 3000);
app.set('view engine', 'ejs');
app.set('trust proxy', true);

app.use(favicon((global as any).appDir('./modules/cde/public/assets/img/favicon.ico'))); // TODO: MOVE TO SYSTEM

app.use(bodyParser.urlencoded({extended: false, limit: '5mb'}));
app.use(bodyParser.json({limit: '16mb'}));
app.use(methodOverride());
app.use(cookieParser());
const expressSettings = {
    store: sessionStore,
    secret: config.sessionKey,
    proxy: config.proxy,
    resave: false,
    saveUninitialized: false,
    cookie: {httpOnly: true, secure: config.proxy, maxAge: config.inactivityTimeout}
};

const getRealIp = (req) => {
    if (req._remoteAddress) {
        return req._remoteAddress;
    }
    if (req.ip) {
        return req.ip;
    }
};

let blackIps: string[] = [];
app.use((req, res, next) => {
    if (blackIps.indexOf(getRealIp(req)) !== -1) {
        res.status(403).send('Access is temporarily disabled. If you think you received this response in error, please contact' +
            ' support. Otherwise, please try again in an hour.');
    } else {
        next();
    }
});
const banEndsWith = config.banEndsWith || [];
const banStartsWith = config.banStartsWith || [];

const releaseHackersFrequency = 5 * 60 * 1000;
const keepHackerForDuration = 1000 * 60 * 60 * 24;
// every minute, get latest list.
setInterval(() => {
    getTrafficFilter();
}, 60 * 1000);


// check https
app.use((req, res, next) => {
    if (config.proxy && req.originalUrl !== '/status/cde') {
        if (req.protocol !== 'https') {
            if (req.query.gotohttps === '1') {
                res.send('Missing X-Forward-Proto Header');
            } else {
                res.redirect(config.publicUrl + '?gotohttps=1');
            }
        } else {
            next();
        }
    } else {
        next();
    }
});

app.use(function banHackers(req, res, next) {
    banEndsWith.forEach(ban => {
        if (req.originalUrl.slice(-(ban.length)) === ban) {
            const ip = getRealIp(req);
            banIp(ip, req.originalUrl);
            blackIps.push(ip);
        }
    });
    banStartsWith.forEach(ban => {
        if (req.originalUrl.substr(0, ban.length) === ban) {
            const ip = getRealIp(req);
            banIp(ip, req.originalUrl);
            blackIps.push(ip);
        }
    });
    next();
});

app.use(function preventSessionCreation(req, res, next) {
    function isFile(req) {
        if (req.originalUrl.substr(req.originalUrl.length - 3, 3) === '.js') {
            return true;
        }
        if (req.originalUrl.substr(req.originalUrl.length - 4, 4) === '.css') {
            return true;
        }
        return req.originalUrl.substr(req.originalUrl.length - 4, 4) === '.gif';
    }

    if ((req.cookies['connect.sid'] || req.originalUrl === '/login' || req.originalUrl === '/csrf') && !isFile(req)) {
        session(expressSettings)(req, res, next);
    } else {
        next();
    }

});

app.use('/cde/public', express.static((global as any).appDir('modules/cde/public')));
app.use('/system/public', express.static((global as any).appDir('modules/system/public')));
app.use('/swagger/public', express.static((global as any).appDir('modules/swagger/public')));
app.use('/form/public', express.static((global as any).appDir('modules/form/public')));

function getS3Link(subpath: string): httpProxy.ProxyOptions {
    return {
        https: true,
        proxyReqOptDecorator: proxyReqOpts => {
            (proxyReqOpts as any).rejectUnauthorized = false;
            return proxyReqOpts;
        },
        proxyReqPathResolver: req => '/' + config.s3.path + '/' + subpath + req.url
    };
}

function getS3LinkFhir(subpath: string): httpProxy.ProxyOptions {
    const link = getS3Link(subpath);
    link.filter = req => !req.url.startsWith('/launch/') && !req.url.startsWith('/form/');
    return link;
}

if (config.s3) {
    app.use('/app', httpProxy(config.s3.host, getS3Link('app')));
    app.use('/common', httpProxy(config.s3.host, getS3Link('common')));
    app.use('/embed', httpProxy(config.s3.host, getS3Link('embed')));
    app.use('/fhir', httpProxy(config.s3.host, getS3LinkFhir('fhir')));
    app.use('/launch', httpProxy(config.s3.host, getS3Link('launch')));
    app.use('/native', httpProxy(config.s3.host, getS3Link('native')));
} else {
    app.use('/app', express.static((global as any).appDir('dist/app'), {
        setHeaders: res => res.header('Access-Control-Allow-Origin', '*')
    }));
    app.use('/common', express.static((global as any).appDir('dist/common')));
    app.use('/embed', express.static((global as any).appDir('dist/embed')));
    app.use('/fhir', express.static((global as any).appDir('dist/fhir')));
    app.use('/launch', express.static((global as any).appDir('dist/launch')));
    app.use('/native', express.static((global as any).appDir('dist/native')));
}

['/embedded/public', '/_embedApp/public'].forEach(p => {
    app.use(p, (req, res, next) => {
            res.removeHeader('x-frame-options');
            next();
        },
        express.static(path.join(__dirname, '/modules/_embedApp/public'))
    );
});

app.use(flash());
authInit(app);

const logFormat = {
    remoteAddr: ':real-remote-addr',
    url: ':url',
    method: ':method',
    httpStatus: ':status',
    date: ':date',
    referrer: ':referrer',
    responseTime: ':response-time'
};

morganLogger.token('real-remote-addr', (req) => {
    return getRealIp(req);
});

const winstonStream = {
    write: (message) => {
        expressLogger.info(message);
    }
};

const expressLogger1 = morganLogger(JSON.stringify(logFormat), {stream: winstonStream});

if (config.expressLogFile) {
    const logger = new (winston.Logger)({
        transports: [new Rotate({
            file: config.expressLogFile
        })]
    });
    const fileStream = {
        write: (message) => {
            logger.info(message);
        }
    };
    app.use(morganLogger(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]' +
        ' ":referrer" ":user-agent" ":response-time ms"', {stream: fileStream}));
}

let connections = 0;
setInterval(() => connections = 0, 60000);

app.use((req, res, next) => {
    const maxLogsPerMinute = config.maxLogsPerMinute || 1000;
    connections++;
    if (connections > maxLogsPerMinute) {
        return next();
    } else {
        expressLogger1(req, res, next);
    }
});

app.set('views', path.join(__dirname, './modules'));

const originalRender = express.response.render;
express.response.render = function renderEjsUsingThis(view, module, msg) {
    if (!module) {
        module = 'cde';
    }
    originalRender.call(this, path.join(__dirname, '/modules/' + module + '/views/' + view), msg);
} as any;

try {
    app.use('/server/attachment', [loggedInMiddleware], attachmentModule({
        attachmentApproval: [canApproveAttachmentMiddleware]
    }, [
        {module: 'cde', db: mongo_cde, crudPermission: checkOwnership},
        {module: 'form', db: mongo_form, crudPermission: checkOwnership},
        {module: 'article', db: articleDb, crudPermission: isDocumentationEditor}
    ]));
    app.use('/server/discuss', discussModule({
        allComments: isOrgAuthorityMiddleware,
        manageComment: canApproveCommentMiddleware,
    }));
    app.use('/server/log', logModule({
        feedbackLog: isOrgAuthorityMiddleware,
        superLog: isSiteAdminMiddleware,
    }));
    app.use('/server/uts', utsModule());
    app.use('/server/classification', classificationModule({
        allowClassify: (req, res, next) => {
            if (!isOrgCurator(req.user, req.body.orgName)) {
                return res.status(401).send();
            }
            next();
        }
    }));
    app.use('/server/mesh', meshModule({
        allowSyncMesh: (req, res, next) => {
            if (!config.autoSyncMesh && !isOrgAuthority(req.user)) {
                return res.status(401).send();
            }
            next();
        }
    }));
    app.use('/nativeRender', nativeRenderModule());
    app.use('/', embedModule());
    app.use('/', fhirModule());
    cdeInit(app, daoManager);
    systemInit(app);
    formInit(app, daoManager);
    app.use('/server/board', boardModule());
    swaggerInit(app);
    app.use('/server/user', userModule({
        search: isOrgAdminMiddleware,
        manage: isOrgAuthorityMiddleware
    }));
    app.use('/server/siteAdmin', isSiteAdminMiddleware, siteAdminModule());
    app.use('/server/notification', isSiteAdminMiddleware, notificationModule({
        notificationDate: isSiteAdminMiddleware
    }));
    app.use('/server/article', articleModule({
        update: [isOrgAuthorityMiddleware],
    }));

} catch (e) {
    console.log(e.stack);
    process.exit();
}

app.use('/robots.txt', express.static(path.join(__dirname, '/modules/system/public/robots.txt')));

// final route -> 404
app.use((req, res, next) => {
    // swagger is the real final route
    if (req.originalUrl === '/docs' || req.originalUrl === '/api-docs' || req.originalUrl.indexOf('/docs/') === 0) {
        return next();
    }
    respondHomeFull(req, res);
});


app.use((err, req, res, next) => {

    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(401).send('CSRF Error');
    }

    // to test => restassured with simple post
    if (err.type === 'charset.unsupported') {
        return res.status(400).send('Unsupported charset');
    }

    // Do Log Errors
    console.log('ERROR3: ' + err);
    console.log(err.stack);
    if (req && req.body && req.body.password) {
        req.body.password = '';
    }
    const meta = {
        stack: err.stack,
        origin: 'app.express.error',
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
    errorLogger.error('error', 'Error: Express Default Error Handler', meta);
    res.status(500).send('Something broke!');
});

domain.run(() => {
    const server = http.createServer(app);
    exports.server = server;
    server.listen(app.get('port'), () => {
        console.log('Express server listening on port ' + app.get('port'));
    });
    startServer(server, expressSettings);
});
