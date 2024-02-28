import 'server/globals';
import * as bodyParser from 'body-parser';
import * as compress from 'compression';
import * as MongoStore from 'connect-mongo';
import * as cookieParser from 'cookie-parser';
import * as Domain from 'domain';
import * as express from 'express';
import { ErrorRequestHandler, Request } from 'express';
import * as session from 'express-session';
import * as helmet from 'helmet';
import * as http from 'http';
import * as methodOverride from 'method-override';
import { MongoClient } from 'mongodb';
import * as morganLogger from 'morgan';
import { MulterError } from 'multer';
import { config, dbPlugins } from 'server';
import { module as articleModule } from 'server/article/articleRoutes';
import { module as attachmentModule } from 'server/attachment/attachmentRoutes';
import { module as boardModule } from 'server/board/boardRoutes';
import { module as deModule } from 'server/cde/deRouters';
import { module as classificationModule } from 'server/classification/classificationRoutes';
import { module as discussModule } from 'server/discuss/discussRoutes';
import { module as formModule } from 'server/form/formRouters';
import { module as loaderModule } from 'server/loader/loaderRoutes';
import { module as logModule } from 'server/log/logRoutes';
import { module as orgManagementModule } from 'server/orgManagement/orgManagementRoutes';
import { module as nativeRenderModule } from 'server/nativeRender/nativeRenderRouters';
import { module as siteAdminModule } from 'server/siteAdmin/siteAdminRoutes';
import { module as submissionModule } from './submission/submissionRoutes';
import { init as swaggerInit } from 'server/swagger';
import { module as appModule, respondHomeFull } from 'server/system/appRouters';
import {
    canAttachMiddleware,
    canEditArticleMiddleware,
    canSeeCommentMiddleware,
    checkEditing,
    isOrgAdminMiddleware,
    isOrgAuthorityMiddleware,
    isSiteAdminMiddleware,
} from 'server/system/authorization';
import { establishConnection } from 'server/system/connections';
import { initEs } from 'server/system/elastic';
import { startSocketIoServer } from 'server/system/ioServer';
import { errorLogger, expressLogger } from 'server/system/logging';
import { module as systemModule } from 'server/system/systemRouters';
import { banHackers, blockBannedIps, banIp, bannedIps } from 'server/system/trafficFilterSvc';
import { init as authInit } from 'server/user/authentication';
import { module as userModule } from 'server/user/userRoutes';
import { module as utsModule } from 'server/uts/utsRoutes';
import { canClassifyOrg, isDocumentationEditor } from 'shared/security/authorizationShared';
import { Logger, transports } from 'winston';

require('source-map-support').install();
const flash = require('connect-flash');
const hsts = require('hsts');

const domain = Domain.create();

initEs();

console.log('Node ' + process.versions.node);
console.log('Node Environment ' + process.env.NODE_ENV);

const app = express();

app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'", 'fonts.gstatic.com', '*.youtube.com'],
            fontSrc: ["'self'", 'fonts.gstatic.com', '*.nih.gov'],
            frameSrc: ["'self'", '*.youtube.com', config.uts.ssoServerOrigin],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                'cdn.ckeditor.com',
                'cdn.jsdelivr.net',
                'script.crazyegg.com',
                'cdnjs.cloudflare.com',
                '*.nih.gov',
                'ajax.googleapis.com',
                'www.googletagmanager.com',
                'www.google-analytics.com',
            ],
            styleSrc: [
                "'self'",
                'maxcdn.bootstrapcdn.com',
                'fonts.googleapis.com',
                'fonts.gstatic.com',
                "'unsafe-inline'",
                '*.nih.gov',
                'cdn.ckeditor.com',
            ],
            imgSrc: [
                "'self'",
                'data:',
                'cdn.ckeditor.com',
                '*.nih.gov',
                'www.google-analytics.com',
                'www.googletagmanager.com',
            ],
            connectSrc: ['*'],
            reportUri: 'https://nlmoccs.report-uri.com/r/d/csp/reportOnly',
            workerSrc: ['*', 'blob:'],
        },
    })
);
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(compress());

app.use(hsts({ maxAge: 31536000000 }));

process.on('unhandledRejection', err => {
    // Promise Error events are not Node Error objects, they are usually strings
    const message = `Error: Unhandled Promise Rejection: ${err}`;
    console.error(message);
    errorLogger.error(message, {
        origin: 'app.process.unhandledRejection',
        stack: (err && (err as any).stack) || err,
    });
});

process.on('uncaughtException', err => {
    console.error('Error: Process Uncaught Exception');
    console.error(err.stack || err);
    errorLogger.error('Error: Uncaught Exception', {
        origin: 'app.process.uncaughtException',
        stack: err.stack || err,
    });
});

domain.on('error', err => {
    console.error('Error: Domain Error');
    console.error(err.stack || err);
    errorLogger.error('Error: Domain Error', {
        origin: 'app.domain.error',
        stack: err.stack || err,
    });
});

// all environments
app.set('port', config.port || 3000);
app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.set('views', __dirname);

app.use(blockBannedIps);
app.use(banHackers);

app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(bodyParser.json({ limit: '16mb' }));
app.use(methodOverride());
app.use(cookieParser());

declare global {
    namespace Express {
        interface Request {
            _remoteAddress: string; // morgan bug
            // files: any; // attachmentSvc impl differs from multer
        }
    }
}

const getRealIp = (req: Request): string => {
    if (req._remoteAddress) {
        return req._remoteAddress;
    }
    if (req.ip) {
        return req.ip;
    }
    return '';
};

// check https
app.use((req, res, next) => {
    if (config.proxy && req.originalUrl !== '/server/system/status/cde') {
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

let mongoClient: MongoClient | null = null;
establishConnection(config.database.appData)
    .asPromise()
    .then(
        conn => {
            mongoClient = conn.getClient();
        },
        err => console.log(`app db connection failed with error ${err}`)
    );
require('deasync').loopWhile(() => !mongoClient);
if (!mongoClient) {
    console.log('Error connecting to mongo');
    process.exit(1);
}
const expressSettings = {
    store: MongoStore.create({
        client: mongoClient,
        touchAfter: 60,
    }),
    secret: config.sessionKey,
    proxy: config.proxy,
    resave: false,
    rolling: true,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: config.proxy, maxAge: 60 * 60 * 1000 },
};
app.use(session(expressSettings));

/*
function getS3Link(subPath: string): httpProxy.ProxyOptions {
    return {
        https: true,
        skipToNextHandlerFilter: proxyRes => {
          console.log(proxyRes.statusCode);
          console.log(proxyRes);
          return proxyRes.statusCode === 404;
        }
        ,
        proxyReqOptDecorator: proxyReqOpts => {
            (proxyReqOpts as any).rejectUnauthorized = false;
            return proxyReqOpts;
        },
        proxyReqPathResolver: req => `/${config.s3.path}/${subPath + req.url}`
    };
}

if (config.s3) {
    app.use('/', httpProxy(config.s3.host, getS3Link('cde-cli')));
    app.use('/native', httpProxy(config.s3.host, getS3Link('nativeRender')));
} else {
    app.use('/', express.static(global.assetDir('dist/cde-cli/')));
    app.use('/native', express.static(global.assetDir('dist/nativeRender/')));
}
*/

app.use('/', express.static(global.assetDir('dist/cde-cli/')));
app.use('/native', express.static(global.assetDir('dist/nativeRender/')));

app.use(flash());
authInit(app);

const logFormat = {
    remoteAddr: ':real-remote-addr',
    url: ':url',
    method: ':method',
    httpStatus: ':status',
    date: ':date',
    referrer: ':referrer',
    responseTime: ':response-time',
};

morganLogger.token('real-remote-addr', (req: Request) => {
    return getRealIp(req);
});

const expressLogger1 = morganLogger(JSON.stringify(logFormat), {
    stream: {
        write: (message: string) => {
            expressLogger.info(message);
        },
    },
});

if (config.expressLogFile) {
    const logger = new Logger({
        transports: [
            new transports.File({
                filename: config.expressLogFile,
            }),
        ],
    });
    app.use(
        morganLogger(
            ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]' +
                ' ":referrer" ":user-agent" ":response-time ms"',
            {
                stream: {
                    write: message => {
                        logger.info(message);
                    },
                },
            }
        )
    );
}

let connections = 0;
setInterval(() => (connections = 0), 60000);

app.use((req, res, next) => {
    const maxLogsPerMinute = config.maxLogsPerMinute || 1000;
    connections++;
    if (connections > maxLogsPerMinute) {
        return next();
    } else {
        expressLogger1(req, res, next);
    }
});

try {
    app.use('/', appModule());
    app.use('/server/attachment/cde', canAttachMiddleware, attachmentModule(dbPlugins.dataElement, checkEditing));
    app.use('/server/attachment/form', canAttachMiddleware, attachmentModule(dbPlugins.form, checkEditing));
    app.use(
        '/server/attachment/article',
        canEditArticleMiddleware,
        attachmentModule(dbPlugins.article, isDocumentationEditor)
    );
    app.use(
        '/server/discuss',
        discussModule({
            allComments: isOrgAuthorityMiddleware,
            canSeeComment: canSeeCommentMiddleware,
        })
    );
    app.use(
        '/server/log',
        logModule({
            feedbackLog: isOrgAuthorityMiddleware,
            superLog: isSiteAdminMiddleware,
        })
    );
    app.use('/server/uts', utsModule());
    app.use(
        '/server/classification',
        classificationModule({
            allowClassify: (req, res, next) => {
                if (!canClassifyOrg(req.user, req.body.orgName)) {
                    return res.status(401).send();
                }
                next();
            },
        })
    );
    app.use('/nativeRender', nativeRenderModule());
    app.use('/server/system', systemModule());
    app.use('/', deModule());
    app.use('/', formModule());
    app.use('/server/board', boardModule());
    app.use('/server/submission', submissionModule());
    swaggerInit(app);
    app.use(
        '/server/user',
        userModule({
            search: isOrgAdminMiddleware,
            manage: isOrgAuthorityMiddleware,
        })
    );
    app.use('/server/siteAdmin', isSiteAdminMiddleware, siteAdminModule());
    app.use('/server/orgManagement', orgManagementModule());
    app.use('/server/article', articleModule());

    app.use('/server/loader', isOrgAuthorityMiddleware, loaderModule());
} catch (e: any) {
    console.error(e.stack);
    process.exit();
}

// final route -> 404
app.use((req, res, next) => {
    // swagger is the real final route
    if (req.originalUrl === '/docs' || req.originalUrl === '/api-docs' || req.originalUrl.indexOf('/docs/') === 0) {
        return next();
    }
    respondHomeFull(req, res);
});

app.use(((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(401).send('CSRF Error');
    }

    if (err instanceof SyntaxError && ['/api/de/search'].includes(req.url)) {
        res.status(400).send('Malformed JSON');
        return;
    }

    if (err.type === 'entity.parse.failed') {
        const ip = getRealIp(req);
        banIp(ip, req.originalUrl);
        bannedIps.push(ip);
        return res.status(403).send('Not authorized');
    }

    // to test => restassured with simple post
    if (err.type === 'charset.unsupported') {
        return res.status(400).send('Unsupported charset');
    }

    if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send('File too large');
    }

    // Do Log Errors
    console.error('ERROR3: ' + err);
    console.error(err.stack);
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
            headers: { 'user-agent': req.headers['user-agent'] },
            errorCode: err.code,
            errorType: err.type,
        },
    };
    errorLogger.error('error', 'Error: Express Default Error Handler', meta);
    res.status(500).send('Something broke!');
}) as ErrorRequestHandler);

domain.run(async () => {
    const server = http.createServer(app);
    await startSocketIoServer(server, expressSettings, mongoClient);
    server.listen(app.get('port'), () => {
        console.log('Express server listening on port ' + app.get('port'));
    });
});
