import {
    canApproveCommentMiddleware,
    isOrgAdminMiddleware,
    isOrgAuthorityMiddleware, isOrgCuratorMiddleware, isSiteAdminMiddleware, loggedInMiddleware, nocacheMiddleware
} from '../system/authorization';
import { isOrgAdmin } from 'shared/system/authorizationShared';
import { handleError, respondError } from '../errorHandler/errorHandler';
import { config } from '../system/parseConfig';

const async = require('async');
const CronJob = require('cron').CronJob;
const csrf = require('csurf');
const ejs = require('ejs');
const fs = require('fs');
const _ = require('lodash');
const passport = require('passport');
const path = require('path');
const useragent = require('useragent');
const util = require('util');
const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const mongo_data = require('./mongo-data');
const IdSource = mongo_data.IdSource;
const dbLogger = require('../log/dbLogger');
const logging = require('./logging');
const orgsvc = require('./orgsvc');
const usersrvc = require('./usersrvc');
const esInit = require('./elasticSearchInit');
const elastic = require('./elastic');
const meshElastic = require('../mesh/elastic');
const fhirApps = require('./fhir').fhirApps;
const fhirObservationInfo = require('./fhir').fhirObservationInfo;
const traffic = require('./traffic');
const pushNotification = require('./pushNotification');

export let respondHomeFull: Function;

export function init(app) {
    let getRealIp = function (req) {
        if (req._remoteAddress) return req._remoteAddress;
        if (req.ip) return req.ip;
    };

    let version = 'local-dev';
    try {
        version = require('./version.js').version;
    } catch (e) {
    }

    let embedHtml = '';
    ejs.renderFile('modules/_embedApp/embedApp.ejs', {isLegacy: false}, (err, str) => {
        embedHtml = str;
    });

    let embedLegacyHtml = '';
    ejs.renderFile('modules/_embedApp/embedApp.ejs', {isLegacy: true}, (err, str) => {
        embedLegacyHtml = str;
        if (embedLegacyHtml) {
            util.promisify(fs.access)('modules/_embedApp/public/html', 'r')
                .catch(() => util.promisify(fs.mkdir)('modules/_embedApp/public/html', {recursive: true}))
                .then(() => {
                    fs.writeFile('modules/_embedApp/public/html/index.html', embedLegacyHtml, err => {
                        if (err) {
                            console.log('ERROR generating /modules/_embedApp/public/html/index.html: ' + err);
                        }
                    });
                })
                .catch(err => dbLogger.consoleLog('Error getting folder modules/_embedApp/public: ', err));
        }
    });

    let fhirHtml = '';
    ejs.renderFile('modules/_fhirApp/fhirApp.ejs', {isLegacy: false, version: version}, (err, str) => {
        fhirHtml = str;
    });

    let fhirLegacyHtml = '';
    ejs.renderFile('modules/_fhirApp/fhirApp.ejs', {isLegacy: true, version: version}, (err, str) => {
        fhirLegacyHtml = str;
    });

    let indexHtml = '';
    ejs.renderFile('modules/system/views/index.ejs', {
        config: config,
        isLegacy: false,
        version: version
    }, (err, str) => {
        indexHtml = str;
    });

    let indexLegacyHtml = '';
    ejs.renderFile('modules/system/views/index.ejs', {config: config, isLegacy: true, version: version}, (err, str) => {
        indexLegacyHtml = str;
    });

    let homeHtml = '';
    ejs.renderFile('modules/system/views/home-launch.ejs', {config: config, version: version}, (err, str) => {
        homeHtml = str;
    });

    let nativeRenderHtml = '';
    ejs.renderFile('modules/_nativeRenderApp/nativeRenderApp.ejs', {isLegacy: false, version: version}, (err, str) => {
        nativeRenderHtml = str;
    });

    let nativeRenderLegacyHtml = '';
    ejs.renderFile('modules/_nativeRenderApp/nativeRenderApp.ejs', {isLegacy: true, version: version}, (err, str) => {
        nativeRenderLegacyHtml = str;
    });

    /* for IE Opera Safari, emit polyfill.js */
    function isModernBrowser(req) {
        let ua = useragent.is(req.headers['user-agent']);
        return ua.chrome || ua.firefox || ua.edge;
    }

    /* for search engine and javascript disabled */
    function isSearchEngine(req) {
        let userAgent = req.headers['user-agent'];
        return userAgent && userAgent.match(/bot|crawler|spider|crawling/gi);
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

    app.get('/cde/search', (req, res) => {
        let selectedOrg = req.query.selectedOrg;
        let pageString = req.query.page; // starting from 1
        if (!pageString) pageString = '1';
        if (isSearchEngine(req)) {
            if (selectedOrg) {
                let pageNum = _.toInteger(pageString);
                let pageSize = 20;
                let cond = {
                    'classification.stewardOrg.name': selectedOrg,
                    archived: false,
                    'registrationState.registrationStatus': 'Qualified'
                };
                mongo_cde.count(cond, (err, totalCount) => {
                    if (err) {
                        res.status(500).send('ERROR - Static Html Error, /cde/search');
                        logging.errorLogger.error('Error: Static Html Error', {
                            stack: err.stack,
                            origin: req.url
                        });
                    } else {
                        mongo_cde.DataElement.find(cond, 'tinyId designations', {
                            skip: pageSize * (pageNum - 1),
                            limit: pageSize
                        }, (err, cdes) => {
                            if (err) {
                                res.status(500).send('ERROR - Static Html Error, /cde/search');
                                logging.errorLogger.error('Error: Static Html Error', {
                                    stack: err.stack,
                                    origin: req.url
                                });
                            } else {
                                let totalPages = totalCount / pageSize;
                                if (totalPages % 1 > 0) totalPages = totalPages + 1;
                                res.render('bot/cdeSearchOrg', 'system', {
                                    cdes: cdes,
                                    totalPages: totalPages,
                                    selectedOrg: selectedOrg
                                });
                            }
                        });
                    }
                });
            } else {
                res.render('bot/cdeSearch', 'system');
            }
        } else {
            respondHomeFull(req, res);
        }
    });

    app.get('/deView', function (req, res) {
        let tinyId = req.query.tinyId;
        let version = req.query.version;
        mongo_cde.byTinyIdVersion(tinyId, version, (err, cde) => {
            if (err) {
                res.status(500).send('ERROR - Static Html Error, /deView');
                logging.errorLogger.error('Error: Static Html Error', {
                    stack: err.stack,
                    origin: req.url
                });
            } else {
                if (isSearchEngine(req)) {
                    res.render('bot/deView', 'system', {elt: cde});
                } else {
                    respondHomeFull(req, res);
                }
            }
        });
    });

    app.get('/form/search', function (req, res) {
        let selectedOrg = req.query.selectedOrg;
        let pageString = req.query.page; // starting from 1
        if (!pageString) pageString = '1';
        if (isSearchEngine(req)) {
            if (selectedOrg) {
                let pageNum = _.toInteger(pageString);
                let pageSize = 20;
                let cond = {
                    'classification.stewardOrg.name': selectedOrg,
                    archived: false,
                    'registrationState.registrationStatus': 'Qualified'
                };
                mongo_form.Form.countDocuments(cond, (err, totalCount) => {
                    if (err) {
                        res.status(500).send('ERROR - Static Html Error, /form/search');
                        logging.errorLogger.error('Error: Static Html Error', {
                            stack: err.stack,
                            origin: req.url
                        });
                    } else {
                        mongo_form.Form.find(cond, 'tinyId designations', {
                            skip: pageSize * (pageNum - 1),
                            limit: pageSize
                        }, (err, forms) => {
                            if (err) {
                                res.status(500).send('ERROR - Static Html Error, /form/search');
                                logging.errorLogger.error('Error: Static Html Error', {
                                    stack: err.stack,
                                    origin: req.url
                                });
                            } else {
                                let totalPages = totalCount / pageSize;
                                if (totalPages % 1 > 0) totalPages = totalPages + 1;
                                res.render('bot/formSearchOrg', 'system', {
                                    forms: forms,
                                    totalPages: totalPages,
                                    selectedOrg: selectedOrg
                                });
                            }
                        });
                    }
                });
            } else {
                res.render('bot/formSearch', 'system');
            }
        } else {
            respondHomeFull(req, res);
        }
    });

    app.get('/formView', function (req, res) {
        let tinyId = req.query.tinyId;
        let version = req.query.version;
        mongo_form.byTinyIdVersion(tinyId, version, (err, cde) => {
            if (err) {
                res.status(500).send('ERROR - Static Html Error, /formView');
                logging.errorLogger.error('Error: Static Html Error', {
                    stack: err.stack,
                    origin: req.url
                });
            } else {
                if (isSearchEngine(req)) {
                    res.render('bot/formView', 'system', {elt: cde});
                } else {
                    respondHomeFull(req, res);
                }
            }
        });
    });


    new CronJob('00 00 4 * * *', () => meshElastic.syncWithMesh(), null, true, 'America/New_York');

    // every sunday at 4:07 AM
    new CronJob('* 7 4 * * 6', () => {
        dbLogger.consoleLog('Creating sitemap');
        util.promisify(fs.access)('dist/app', 'r')
            .catch(() => util.promisify(fs.mkdir)('dist/app', {recursive: true}))
            .then(() => {
                let wstream = fs.createWriteStream('./dist/app/sitemap.txt');
                let cond = {
                    archived: false,
                    'registrationState.registrationStatus': 'Qualified'
                };

                function handleStream(stream, formatter, cb) {
                    stream.on('data', doc => wstream.write(formatter(doc)));
                    stream.on('err', cb);
                    stream.on('end', cb);
                }

                return util.promisify(async.series)([
                    cb => handleStream(
                        mongo_cde.DataElement.find(cond, 'tinyId').cursor(),
                        doc => config.publicUrl + '/deView?tinyId=' + doc.tinyId + '\n',
                        cb
                    ),
                    cb => handleStream(
                        mongo_form.Form.find(cond, 'tinyId').cursor(),
                        doc => config.publicUrl + '/formView?tinyId=' + doc.tinyId + '\n',
                        cb
                    )
                ]).then(() => {
                    dbLogger.consoleLog('done with sitemap');
                    wstream.end();
                });
            })
            .catch(err => dbLogger.consoleLog('Cron Sunday 4:07 AM did not complete due to error:', err));
    }, null, true, 'America/New_York', undefined, true);

    app.get(['/help/:title', '/createForm', '/createCde', '/boardList',
            '/board/:id', '/myBoards', '/cdeStatusReport', '/api', '/sdcview', '/404', '/whatsNew', '/contactUs',
            '/quickBoard', '/searchPreferences', '/siteAudit', '/siteAccountManagement', '/orgAccountManagement',
            '/classificationManagement', '/profile', '/login', '/orgAuthority', '/orgComments'],
        respondHomeFull
    );

    app.get('/embedSearch', (req, res) => {
        res.send(isModernBrowser(req) ? embedHtml : embedLegacyHtml);
    });

    app.get('/fhir/form/:param', (req, res) => {
        res.send(isModernBrowser(req) ? fhirHtml : fhirLegacyHtml);
    });

    app.get('/fhir/launch/:param', (req, res) => {
        res.sendFile(path.join(__dirname, '../../modules/_fhirApp', 'fhirAppLaunch.html'), undefined, err => {
            if (err) res.sendStatus(404);
        });
    });

    app.get('/fhirObservationInfo', (req, res) => {
        fhirObservationInfo.get(res, req.query.id, info => res.send(info));
    });

    app.put('/fhirObservationInfo', loggedInMiddleware, (req, res) => {
        fhirObservationInfo.put(res, req.body, info => res.send(info));
    });

    app.get('/nativeRender', (req, res) => {
        res.send(isModernBrowser(req) ? nativeRenderHtml : nativeRenderLegacyHtml);
    });

    app.get('/sw.js', function (req, res) {
        res.sendFile((global as any).appDir('dist/app', 'sw.js'), undefined, err => {
            if (err) res.sendStatus(404);
        });
    });

    pushNotification.checkDatabase();
    app.post('/pushRegistration', loggedInMiddleware, pushNotification.create);
    app.delete('/pushRegistration', loggedInMiddleware, pushNotification.remove);
    app.post('/pushRegistrationSubscribe', loggedInMiddleware, pushNotification.subscribe);
    app.post('/pushRegistrationUpdate', pushNotification.updateStatus);

    app.get('/jobStatus/:type', function (req, res) {
        let jobType = req.params.type;
        if (!jobType) return res.status(400).end();
        mongo_data.jobStatus(jobType, (err, j) => {
            if (err) return res.status(409).send('Error - job status ' + jobType);
            if (j) return res.send({done: false});
            res.send({done: true});
        });
    });

    /* ---------- PUT NEW REST API above ---------- */

    app.get('/indexCurrentNumDoc/:indexPosition', isSiteAdminMiddleware, (req, res) => {
        let index = esInit.indices[req.params.indexPosition];
        return res.send({count: index.count, totalCount: index.totalCount});
    });

    app.post('/reindex/:indexPosition', isSiteAdminMiddleware, (req, res) => {
        let index = esInit.indices[req.params.indexPosition];
        elastic.reIndex(index, () => {
            setTimeout(() => {
                index.count = 0;
                index.totalCount = 0;
            }, 5000);
        });
        return res.send();
    });


    app.get('/supportedBrowsers', (req, res) => res.render('supportedBrowsers', 'system'));

    app.get('/listOrgs', nocacheMiddleware, (req, res) => {
        mongo_data.listOrgs(function (err, orgs) {
            if (err) return res.status(500).send('ERROR - unable to list orgs');
            res.send(orgs);
        });
    });

    app.get('/listOrgsDetailedInfo', nocacheMiddleware, (req, res) => {
        mongo_data.listOrgsDetailedInfo(function (err, orgs) {
            if (err) {
                logging.errorLogger.error(JSON.stringify({msg: 'Failed to get list of orgs detailed info.'}),
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
            traffic.banIp(getRealIp(req), 'Invalid Login body');
            return res.status(401).send();
        }
        if (Object.keys(req.query).length) {
            traffic.banIp(getRealIp(req), 'Passing params to /login');
            return res.status(401).send();
        }
        return next();
    }

    const validLoginBody = ['username', 'password', '_csrf', 'recaptcha'];

    app.post('/login', [checkLoginReq, myCsrf], (req, res, next) => {
        let failedIp = findFailedIp(getRealIp(req));
        async.series([
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
                    passport.authenticate('local', (err, user, info) => {
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
        return mongo_data.orgByName(req.params.name, (err, result) => res.send(result));
    });


    app.get('/managedOrgs', orgsvc.managedOrgs);
    app.post('/addOrg', isOrgAuthorityMiddleware, orgsvc.addOrg);
    app.post('/updateOrg', isOrgAuthorityMiddleware, (req, res) => mongo_data.updateOrg(req.body, res));

    app.get('/user/:search', nocacheMiddleware, loggedInMiddleware, (req, res) => {
        if (!req.params.search) {
            return res.send({});
        } else if (req.params.search === 'me') {
            mongo_data.userById(req.user._id, handleError({req, res}, user => res.send(user)));
        } else {
            mongo_data.usersByName(req.params.search, handleError({req, res}, users => res.send(users)));
        }
    });

    app.get('/myOrgsAdmins', [nocacheMiddleware, loggedInMiddleware], usersrvc.myOrgsAdmins);

    app.get('/orgAdmins', nocacheMiddleware, isOrgAuthorityMiddleware, usersrvc.orgAdmins);
    app.post('/addOrgAdmin', isOrgAdminMiddleware, usersrvc.addOrgAdmin);
    app.post('/removeOrgAdmin', isOrgAdminMiddleware, usersrvc.removeOrgAdmin);

    app.get('/orgCurators', nocacheMiddleware, isOrgAdminMiddleware, usersrvc.orgCurators);
    app.post('/addOrgCurator', isOrgAdminMiddleware, usersrvc.addOrgCurator);
    app.post('/removeOrgCurator', isOrgAdminMiddleware, usersrvc.removeOrgCurator);

    app.post('/updateUserRoles', isOrgAuthorityMiddleware, usersrvc.updateUserRoles);
    app.post('/updateUserAvatar', isOrgAuthorityMiddleware, usersrvc.updateUserAvatar);

    app.get('/data/:id', (req, res) => {
        let fileId = req.params.id;
        const i = fileId.indexOf(".");
        if (i > -1) {
            fileId = fileId.substr(0, i);
        }
        mongo_data.getFile(req.user, fileId, res);
    });

    app.post('/transferSteward', orgsvc.transferSteward);

    app.post('/addCommentAuthor', canApproveCommentMiddleware, (req, res) => {
        mongo_data.addUserRole(req.body.username, 'CommentAuthor', handleError({req, res}, err => {
            if (err) {
                res.status(404).send(err);
                return;
            }
            res.send();
        }));
    });

    app.post('/getClassificationAuditLog', isOrgAuthorityMiddleware, (req, res) => {
        mongo_data.getClassificationAuditLog(req.body, handleError({req, res}, result => {
            res.send(result);
        }));
    });

    app.post('/embed/', isOrgAdminMiddleware, (req, res) => {
        const handlerOptions = {req, res, publicMessage: 'There was an error saving this embed.'};
        mongo_data.embeds.save(req.body, handleError(handlerOptions, embed => {
            res.send(embed);
        }));
    });

    app.delete('/embed/:id', loggedInMiddleware, (req, res) => {
        const handlerOptions = {req, res, publicMessage: 'There was an error removing this embed.'};
        mongo_data.embeds.find({_id: req.params.id}, handleError(handlerOptions, embeds => {
            if (embeds.length !== 1) {
                res.status.send('Expectation not met: one document.');
                return;
            }
            if (!req.isAuthenticated() || !isOrgAdmin(req.user, embeds[0].org)) {
                res.status(403).send();
                return;
            }
            mongo_data.embeds.delete(req.params.id, handleError(handlerOptions, () => res.send()));
        }));
    });

    app.get('/embed/:id', (req, res) => {
        mongo_data.embeds.find({_id: req.params.id}, handleError({req, res}, embeds => {
            if (embeds.length !== 1) {
                res.status.send('Expectation not met: one document.');
                return;
            }
            res.send(embeds[0]);
        }));

    });

    app.get('/embeds/:org', (req, res) => {
        mongo_data.embeds.find({org: req.params.org}, handleError({req, res}, embeds => {
            res.send(embeds);
        }));
    });

    app.get('/fhirApps', (req, res) => fhirApps.find(res, {}, apps => res.send(apps)));
    app.get('/fhirApp/:id', (req, res) => fhirApps.get(res, req.params.id, app => res.send(app)));
    app.post('/fhirApp', isSiteAdminMiddleware,
        (req, res) => fhirApps.save(res, req.body, app => res.send(app)));
    app.delete('/fhirApp/:id', isSiteAdminMiddleware,
        (req, res) => fhirApps.delete(res, req.params.id, () => res.send()));

    app.post('/disableRule', isOrgAuthorityMiddleware, (req, res) => {
        mongo_data.disableRule(req.body, handleError({req, res}, org => {
            res.send(org);
        }));
    });

    app.post('/enableRule', isOrgAuthorityMiddleware, (req, res) => {
        mongo_data.enableRule(req.body, handleError({req, res}, org => {
            res.send(org);
        }));
    });

    app.get('/activeBans', isSiteAdminMiddleware, (req, res) => {
        traffic.getTrafficFilter(list => res.send(list));
    });

    app.post('/removeBan', isSiteAdminMiddleware, (req, res) => {
        traffic.getTrafficFilter(elt => {
            let foundIndex = elt.ipList.findIndex(r => r.ip === req.body.ip);
            if (foundIndex > -1) {
                elt.ipList.splice(foundIndex, 1);
                elt.save(() => res.send());
            } else {
                res.send();
            }
        });
    });

    app.get('/allDrafts', isOrgAuthorityMiddleware, (req, res) => {
        getDrafts(req, res, {});
    });

    app.get('/orgDrafts', isOrgCuratorMiddleware, (req, res) => {
        getDrafts(req, res, {'stewardOrg.name': {$in: usersrvc.myOrgs(req.user)}});
    });

    app.get('/myDrafts', isOrgCuratorMiddleware, (req, res) => {
        getDrafts(req, res, {'updatedBy.username': req.user.username});
    });

    function getDrafts(req, res, criteria) {
        Promise.all([mongo_cde.draftsList(criteria), mongo_form.draftsList(criteria)])
            .then(results => res.send({draftCdes: results[0], draftForms: results[1]}))
            .catch(err => respondError(err, {req, res}));
    }

    app.get('/idSources', (req, res) =>
        IdSource.find({}, handleError({req, res}, sources => res.send(sources))));
    app.get('/idSource/:id', (req, res) =>
        IdSource.findOneById(req.params.id, handleError({req, res}, source => res.send(source))));
    app.post('/idSource/:id', isSiteAdminMiddleware, (req, res) => {
        IdSource.findById(req.params.id, handleError({req, res}, doc => {
            if (doc) return res.status(409).send(req.params.id + " already exists.");
            else {
                let idSource = {
                    _id: req.params.id,
                    linkTemplateDe: req.body.linkTemplateDe,
                    linkTemplateForm: req.body.linkTemplateForm,
                    version: req.body.version,
                };
                new IdSource(idSource).save(handleError({req, res}, source => res.send(source)));
            }
        }));
    });
    app.put('/idSource/:id', isSiteAdminMiddleware, (req, res) => {
        IdSource.findById(req.body._id, handleError({req, res}, doc => {
            if (!doc) return res.status(404).send(req.params.id + " does not exist.");
            else {
                doc.linkTemplateDe = req.body.linkTemplateDe;
                doc.linkTemplateForm = req.body.linkTemplateForm;
                doc.version = req.body.version;
                doc.save(handleError(source => res.send(source)));
            }
        }));
    });
    app.delete('/idSource/:id', isSiteAdminMiddleware, (req, res) =>
        IdSource.delete(res, req.params.id, handleError({req, res}, () => res.send())));
}
