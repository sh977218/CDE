import { series } from 'async';
import { CronJob } from 'cron';
import * as csrf from 'csurf';
import { renderFile } from 'ejs';
import { access, constants, createWriteStream, existsSync, mkdir, writeFileSync } from 'fs';
import { join } from 'path';
import { authenticate } from 'passport';
import { DataElement } from 'server/cde/mongo-cde';
import { handleError, respondError } from 'server/errorHandler/errorHandler';
import { Form } from 'server/form/mongo-form';
import { consoleLog } from 'server/log/dbLogger';
import { syncWithMesh } from 'server/mesh/elastic';
import {
    canApproveCommentMiddleware, isOrgAdminMiddleware, isOrgAuthorityMiddleware, isSiteAdminMiddleware,
    loggedInMiddleware, nocacheMiddleware
} from 'server/system/authorization';
import { reIndex } from 'server/system/elastic';
import { indices } from 'server/system/elasticSearchInit';
import { fhirApps, fhirObservationInfo } from 'server/system/fhir';
import { errorLogger } from 'server/system/logging';
import {
    addUserRole, getFile, jobStatus, listOrgs, listOrgsDetailedInfo, orgByName, userById, usersByName
} from 'server/system/mongo-data';
import { config } from 'server/system/parseConfig';
import { checkDatabase, create, remove, subscribe, updateStatus } from 'server/system/pushNotification';
import { banIp } from 'server/system/traffic';
import {
    addOrgAdmin, addOrgCurator, myOrgsAdmins, orgAdmins, orgCurators, removeOrgAdmin, removeOrgCurator,
    updateUserAvatar, updateUserRoles
} from 'server/system/usersrvc';
import { is } from 'useragent';
import { promisify } from 'util';
import { isSearchEngine } from './helper';
import { version } from '../version';

export let respondHomeFull: Function;

export function init(app) {
    let getRealIp = function (req) {
        if (req._remoteAddress) return req._remoteAddress;
        if (req.ip) return req.ip;
    };

    let fhirHtml = '';
    renderFile('modules/_fhirApp/fhirApp.ejs', {isLegacy: false, version: version}, (err, str) => {
        fhirHtml = str;
    });

    let fhirLegacyHtml = '';
    renderFile('modules/_fhirApp/fhirApp.ejs', {isLegacy: true, version: version}, (err, str) => {
        fhirLegacyHtml = str;
    });

    let indexHtml = '';
    renderFile('modules/system/views/index.ejs', {
        config: config,
        isLegacy: false,
        version: version
    }, (err, str) => {
        indexHtml = str;
        if (existsSync('modules/_app')) {
            writeFileSync('modules/_app/index.html', indexHtml);
        }
    });


    let indexLegacyHtml = '';
    renderFile('modules/system/views/index.ejs', {config: config, isLegacy: true, version: version}, (err, str) => {
        indexLegacyHtml = str;
    });

    let homeHtml = '';
    renderFile('modules/system/views/home-launch.ejs', {config: config, version: version}, (err, str) => {
        homeHtml = str;
    });

    /* for IE Opera Safari, emit polyfill.js */
    function isModernBrowser(req) {
        let ua = is(req.headers['user-agent']);
        return ua.chrome || ua.firefox || ua.edge;
    }

    respondHomeFull = function getIndexHtml(req, res) {
        res.send(isModernBrowser(req) ? indexHtml : indexLegacyHtml);
    };

    app.get(['/', '/home'], function (req, res) {
        if (isSearchEngine(req)) {
            res.render('bot/home', 'system');
        } else if (req.user || req.query.tour || req.query.notifications !== undefined
            || req.headers.referer && req.headers.referer.endsWith('/sw.js')) {
            respondHomeFull(req, res);
        } else {
            res.send(homeHtml);
        }
    });

    app.get('/tour', (req, res) => res.redirect('/home?tour=yes'));

    app.get('/site-version', (req, res) => res.send(version));

    new CronJob('00 00 4 * * *', () => syncWithMesh(), null, true, 'America/New_York');

    // every sunday at 4:07 AM
    new CronJob('* 7 4 * * 6', () => {
        consoleLog('Creating sitemap');
        promisify(access)('dist/app', constants.R_OK)
            .catch(() => promisify(mkdir)('dist/app', {recursive: true} as any)) // Node 12
            .then(() => {
                let wstream = createWriteStream('./dist/app/sitemap.txt');
                let cond = {
                    archived: false,
                    'registrationState.registrationStatus': 'Qualified'
                };

                function handleStream(stream, formatter, cb) {
                    stream.on('data', doc => wstream.write(formatter(doc)));
                    stream.on('err', cb);
                    stream.on('end', cb);
                }

                return promisify(series)([
                    cb => handleStream(
                        DataElement.find(cond, 'tinyId').cursor(),
                        doc => config.publicUrl + '/deView?tinyId=' + doc.tinyId + '\n',
                        cb
                    ),
                    cb => handleStream(
                        Form.find(cond, 'tinyId').cursor(),
                        doc => config.publicUrl + '/formView?tinyId=' + doc.tinyId + '\n',
                        cb
                    )
                ]).then(() => {
                    consoleLog('done with sitemap');
                    wstream.end();
                });
            })
            .catch((err: string) => consoleLog('Cron Sunday 4:07 AM did not complete due to error: ' + err));
    }, null, true, 'America/New_York', undefined, true);

    app.get(['/help/:title', '/createForm', '/createCde', '/boardList',
            '/board/:id', '/myBoards', '/cdeStatusReport', '/api', '/sdcview', '/404', '/whatsNew', '/contactUs',
            '/quickBoard', '/searchPreferences', '/siteAudit', '/siteAccountManagement', '/orgAccountManagement',
            '/classificationManagement', '/profile', '/login', '/orgAuthority', '/orgComments'],
        respondHomeFull
    );

    app.get('/fhir/form/:param', (req, res) => {
        res.send(isModernBrowser(req) ? fhirHtml : fhirLegacyHtml);
    });

    app.get('/fhir/launch/:param', (req, res) => {
        res.sendFile(join(__dirname, '../../modules/_fhirApp', 'fhirAppLaunch.html'), undefined, err => {
            if (err) res.sendStatus(404);
        });
    });

    app.get('/fhirObservationInfo', (req, res) => {
        fhirObservationInfo.get(res, req.query.id, info => res.send(info));
    });

    app.put('/fhirObservationInfo', loggedInMiddleware, (req, res) => {
        fhirObservationInfo.put(res, req.body, info => res.send(info));
    });

    app.get('/sw.js', function (req, res) {
        res.sendFile((global as any).appDir('dist/app', 'sw.js'), undefined, err => {
            if (err) res.sendStatus(404);
        });
    });

    checkDatabase();
    app.post('/pushRegistration', loggedInMiddleware, create);
    app.delete('/pushRegistration', loggedInMiddleware, remove);
    app.post('/pushRegistrationSubscribe', loggedInMiddleware, subscribe);
    app.post('/pushRegistrationUpdate', updateStatus);

    app.get('/jobStatus/:type', function (req, res) {
        let jobType = req.params.type;
        if (!jobType) return res.status(400).end();
        jobStatus(jobType, (err, j) => {
            if (err) return res.status(409).send('Error - job status ' + jobType);
            if (j) return res.send({done: false});
            res.send({done: true});
        });
    });

    /* ---------- PUT NEW REST API above ---------- */

    app.get('/indexCurrentNumDoc/:indexPosition', isSiteAdminMiddleware, (req, res) => {
        let index = indices[req.params.indexPosition];
        return res.send({count: index.count, totalCount: index.totalCount});
    });

    app.post('/reindex/:indexPosition', isSiteAdminMiddleware, (req, res) => {
        let index = indices[req.params.indexPosition];
        reIndex(index, () => {
            setTimeout(() => {
                index.count = 0;
                index.totalCount = 0;
            }, 5000);
        });
        return res.send();
    });


    app.get('/supportedBrowsers', (req, res) => res.render('supportedBrowsers', 'system'));

    app.get('/listOrgs', nocacheMiddleware, (req, res) => {
        listOrgs(function (err, orgs) {
            if (err) return res.status(500).send('ERROR - unable to list orgs');
            res.send(orgs);
        });
    });

    app.get('/listOrgsDetailedInfo', nocacheMiddleware, (req, res) => {
        listOrgsDetailedInfo(function (err, orgs) {
            if (err) {
                errorLogger.error(JSON.stringify({msg: 'Failed to get list of orgs detailed info.'}),
                    {stack: new Error().stack});
                return res.status(403).send('Failed to get list of orgs detailed info.');
            }
            res.send(orgs);
        });
    });

    app.get('/loginText', csrf(), (req, res) => res.render('loginText', 'system', {csrftoken: req.csrfToken()}));

    let failedIps: any[] = [];

    app.get('/csrf', csrf(), nocacheMiddleware, (req, res) => {
        let resp: any = {csrf: req.csrfToken()};
        let failedIp = findFailedIp(getRealIp(req));
        if ((failedIp && failedIp.nb > 2)) {
            resp.showCaptcha = true;
        }
        res.send(resp);
    });

    function findFailedIp(ip) {
        return failedIps.filter(f => f.ip === ip)[0];
    }

    function myCsrf(req, res, next) {
        if (!req.body._csrf) return res.status(401).send();
        csrf()(req, res, next);
    }

    function checkLoginReq(req, res, next) {
        if (Object.keys(req.body).filter(k => validLoginBody.indexOf(k) === -1).length) {
            banIp(getRealIp(req), 'Invalid Login body');
            return res.status(401).send();
        }
        if (Object.keys(req.query).length) {
            banIp(getRealIp(req), 'Passing params to /login');
            return res.status(401).send();
        }
        return next();
    }

    const validLoginBody = ['username', 'password', '_csrf', 'recaptcha'];

    app.post('/login', [checkLoginReq, myCsrf], (req, res, next) => {
        let failedIp = findFailedIp(getRealIp(req));
        series([
                function checkCaptcha(captchaDone) {
                    if (failedIp && failedIp.nb > 2) {
                        captchaDone();
                    } else {
                        captchaDone();
                    }
                }],
            function allDone(err) {
                if (failedIp) failedIp.nb = 0;
                if (err) return res.status(412).send(err);
                // Regenerate is used so appscan won't complain
                req.session.regenerate(() => {
                    authenticate('local', (err, user, info) => {
                        if (err) {
                            respondError(err);
                            return res.status(403).send();
                        }
                        if (!user) {
                            if (failedIp && config.useCaptcha) failedIp.nb++;
                            else {
                                failedIps.unshift({ip: getRealIp(req), nb: 1});
                                failedIps.length = 50;
                            }
                            return res.status(403).send(info);
                        }
                        req.logIn(user, err => {
                            if (err) {
                                respondError(err);
                                return res.status(403).send();
                            }
                            req.session.passport = {user: req.user._id};
                            return res.send('OK');
                        });
                    })(req, res, next);
                });
            });
    });

    app.post('/logout', (req, res) => {
        if (!req.session) return res.status(403).end();
        req.session.destroy(() => {
            req.logout();
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    });

    app.get('/org/:name', nocacheMiddleware, (req, res) => {
        return orgByName(req.params.name, (err, result) => res.send(result));
    });


    app.get('/user/:search', nocacheMiddleware, loggedInMiddleware, (req, res) => {
        if (!req.params.search) {
            return res.send({});
        } else if (req.params.search === 'me') {
            userById(req.user._id, handleError({req, res}, user => res.send(user)));
        } else {
            usersByName(req.params.search, handleError({req, res}, users => res.send(users)));
        }
    });

    app.get('/myOrgsAdmins', [nocacheMiddleware, loggedInMiddleware], myOrgsAdmins);

    app.get('/orgAdmins', nocacheMiddleware, isOrgAuthorityMiddleware, orgAdmins);
    app.post('/addOrgAdmin', isOrgAdminMiddleware, addOrgAdmin);
    app.post('/removeOrgAdmin', isOrgAdminMiddleware, removeOrgAdmin);

    app.get('/orgCurators', nocacheMiddleware, isOrgAdminMiddleware, orgCurators);
    app.post('/addOrgCurator', isOrgAdminMiddleware, addOrgCurator);
    app.post('/removeOrgCurator', isOrgAdminMiddleware, removeOrgCurator);

    app.post('/updateUserRoles', isOrgAuthorityMiddleware, updateUserRoles);
    app.post('/updateUserAvatar', isOrgAuthorityMiddleware, updateUserAvatar);

    app.get('/data/:id', (req, res) => {
        let fileId = req.params.id;
        const i = fileId.indexOf(".");
        if (i > -1) {
            fileId = fileId.substr(0, i);
        }
        getFile(req.user, fileId, res);
    });

    app.post('/addCommentAuthor', canApproveCommentMiddleware, (req, res) => {
        addUserRole(req.body.username, 'CommentAuthor', handleError({req, res}, err => {
            if (err) {
                res.status(404).send(err);
                return;
            }
            res.send();
        }));
    });

    app.get('/fhirApps', (req, res) => fhirApps.find(res, {}, apps => res.send(apps)));
    app.get('/fhirApp/:id', (req, res) => fhirApps.get(res, req.params.id, app => res.send(app)));
    app.post('/fhirApp', isSiteAdminMiddleware,
        (req, res) => fhirApps.save(res, req.body, app => res.send(app)));
    app.delete('/fhirApp/:id', isSiteAdminMiddleware,
        (req, res) => fhirApps.delete(res, req.params.id, () => res.send()));

}
