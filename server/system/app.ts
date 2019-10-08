import { series } from 'async';
import { CronJob } from 'cron';
import * as csrf from 'csurf';
import { renderFile } from 'ejs';
import { Express, Request, Response } from 'express';
import { access, constants, createWriteStream, existsSync, mkdir, writeFileSync } from 'fs';
import { authenticate } from 'passport';
import { dataElementModel, draftsList as deDraftsList } from 'server/cde/mongo-cde';
import { handleError, respondError } from 'server/errorHandler/errorHandler';
import { draftsList as formDraftsList, formModel } from 'server/form/mongo-form';
import { consoleLog } from 'server/log/dbLogger';
import { syncWithMesh } from 'server/mesh/elastic';
import {
    canApproveCommentMiddleware, isOrgAuthorityMiddleware, isOrgCuratorMiddleware, isSiteAdminMiddleware,
    loggedInMiddleware, nocacheMiddleware
} from 'server/system/authorization';
import { reIndex } from 'server/system/elastic';
import { indices } from 'server/system/elasticSearchInit';
import {
    addUserRole, disableRule, enableRule, getFile, jobStatus
} from 'server/system/mongo-data';
import { transferSteward } from 'server/orgManagement/orgSvc';
import { config } from 'server/system/parseConfig';
import { myOrgs, updateUserAvatar, updateUserRoles } from 'server/system/usersrvc';
import { is } from 'useragent';
import { promisify } from 'util';
import { isSearchEngine } from './helper';
import { version } from '../version';

import { banIp, getRealIp, getTrafficFilter } from 'server/system/trafficFilterSvc';
import { userById, usersByName } from 'server/user/userDb';

require('express-async-errors');

export let respondHomeFull: (req: Request, res: Response) => any;

export function init(app: Express) {
    let indexHtml = '';
    renderFile('modules/system/views/index.ejs', {
        config,
        isLegacy: false,
        version
    }, (err, str) => {
        indexHtml = str;
        if (existsSync('modules/_app')) {
            writeFileSync('modules/_app/index.html', indexHtml);
        }
    });


    let indexLegacyHtml = '';
    renderFile('modules/system/views/index.ejs', {config, isLegacy: true, version}, (err, str) => {
        indexLegacyHtml = str;
    });

    let homeHtml = '';
    renderFile('modules/system/views/home-launch.ejs', {config, version}, (err, str) => {
        homeHtml = str;
    });

    /* for IE Opera Safari, emit polyfill.js */
    function isModernBrowser(req) {
        const ua = is(req.headers['user-agent']);
        return ua.chrome || ua.firefox || (ua as any).edge;
    }

    respondHomeFull = function getIndexHtml(req, res) {
        res.send(isModernBrowser(req) ? indexHtml : indexLegacyHtml);
    };

    app.get(['/', '/home'], (req, res) => {
        if (isSearchEngine(req)) {
            res.render('bot/home', 'system' as any);
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
                const wstream = createWriteStream('./dist/app/sitemap.txt');
                const cond = {
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
                        dataElementModel.find(cond, 'tinyId').cursor(),
                        doc => config.publicUrl + '/deView?tinyId=' + doc.tinyId + '\n',
                        cb
                    ),
                    cb => handleStream(
                        formModel.find(cond, 'tinyId').cursor(),
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

    app.get('/sw.js', (req, res) => {
        res.sendFile((global as any).appDir('dist/app', 'sw.js'), undefined, err => {
            if (err) {
                res.sendStatus(404);
            }
        });
    });

    app.get('/jobStatus/:type', function (req, res) {
        let jobType = req.params.type;
        if (!jobType) return res.status(400).end();
        jobStatus(jobType, (err, j) => {
            if (err) {
                return res.status(409).send('Error - job status ' + jobType);
            }
            if (j) {
                return res.send({done: false});
            }
            res.send({done: true});
        });
    });

    /* ---------- PUT NEW REST API above ---------- */

    app.get('/indexCurrentNumDoc/:indexPosition', isSiteAdminMiddleware, (req, res) => {
        const index = indices[req.params.indexPosition];
        return res.send({count: index.count, totalCount: index.totalCount});
    });

    app.post('/reindex/:indexPosition', isSiteAdminMiddleware, (req, res) => {
        const index = indices[req.params.indexPosition];
        reIndex(index, () => {
            setTimeout(() => {
                index.count = 0;
                index.totalCount = 0;
            }, 5000);
        });
        return res.send();
    });


    app.get('/supportedBrowsers', (req, res) => res.render('supportedBrowsers', 'system' as any));

    app.get('/loginText', csrf(), (req, res) => res.render('loginText', 'system' as any, {csrftoken: req.csrfToken()} as any));

    const failedIps: any[] = [];

    app.get('/csrf', csrf(), nocacheMiddleware, (req, res) => {
        const resp: any = {csrf: req.csrfToken()};
        const realIp = getRealIp(req);
        const failedIp = findFailedIp(realIp);
        if ((failedIp && failedIp.nb > 2)) {
            resp.showCaptcha = true;
        }
        res.send(resp);
    });

    function findFailedIp(ip) {
        return failedIps.filter(f => f.ip === ip)[0];
    }

    function myCsrf(req, res, next) {
        if (!req.body._csrf) {
            return res.status(401).send();
        }
        csrf()(req, res, next);
    }

    async function checkLoginReq(req, res, next) {
        const realIp = getRealIp(req);
        if (Object.keys(req.body).filter(k => validLoginBody.indexOf(k) === -1).length) {
            await banIp(realIp, 'Invalid Login body');
            return res.status(401).send();
        }
        if (Object.keys(req.query).length) {
            await banIp(realIp, 'Passing params to /login');
            return res.status(401).send();
        }
        return next();
    }

    const validLoginBody = ['username', 'password', '_csrf', 'recaptcha'];

    app.post('/login', [checkLoginReq, myCsrf], (req, res, next) => {
        const failedIp = findFailedIp(getRealIp(req));
        series([
                function checkCaptcha(captchaDone) {
                    if (failedIp && failedIp.nb > 2) {
                        captchaDone();
                    } else {
                        captchaDone();
                    }
                }],
            function allDone(err) {
                if (failedIp) {
                    failedIp.nb = 0;
                }
                if (err) {
                    return res.status(412).send(err);
                }
                // Regenerate is used so appscan won't complain
                req.session.regenerate(() => {
                    authenticate('local', (err, user, info) => {
                        if (err) {
                            respondError(err);
                            return res.status(403).send();
                        }
                        if (!user) {
                            if (failedIp && config.useCaptcha) {
                                failedIp.nb++;
                            } else {
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
        if (!req.session) {
            return res.status(403).end();
        }
        req.session.destroy(() => {
            req.logout();
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
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

    app.post('/updateUserRoles', isOrgAuthorityMiddleware, updateUserRoles);
    app.post('/updateUserAvatar', isOrgAuthorityMiddleware, updateUserAvatar);

    app.get('/data/:id', (req, res) => {
        let fileId = req.params.id;
        const i = fileId.indexOf('.');
        if (i > -1) {
            fileId = fileId.substr(0, i);
        }
        getFile(req.user, fileId, res);
    });

    app.post('/transferSteward', transferSteward);

    app.post('/addCommentAuthor', canApproveCommentMiddleware, (req, res) => {
        addUserRole(req.body.username, 'CommentAuthor', handleError({req, res}, err => {
            if (err) {
                res.status(404).send(err);
                return;
            }
            res.send();
        }));
    });

}
