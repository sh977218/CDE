const async = require('async');
const CronJob = require('cron').CronJob;
const csrf = require('csurf');
const ejs = require('ejs');
const fs = require('fs');
const _ = require('lodash');
const passport = require('passport');
const path = require('path');
const useragent = require('useragent');
const authorization = require('./authorization');
const authorizationShared = require('@std/esm')(module)("../../shared/system/authorizationShared");
const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const mongo_data = require('./mongo-data');
const config = require('./parseConfig');
const dbLogger = require('../log/dbLogger');
const handleError = dbLogger.handleError;
const logging = require('./logging.js');
const orgsvc = require('./orgsvc');
const pushNotification = require('./pushNotification');
const usersrvc = require('./usersrvc');
const daoManager = require('./moduleDaoManager');
const exportShared = require('@std/esm')(module)('../../shared/system/exportShared');
const esInit = require('./elasticSearchInit');
const elastic = require('./elastic.js');
const meshElastic = require('../mesh/elastic');
const fhirApps = require('./fhir').fhirApps;
const fhirObservationInfo = require('./fhir').fhirObservationInfo;
const cdeElastic = require('../cde/elastic.js');
const formElastic = require('../form/elastic.js');
const traffic = require('./traffic');
const notificationDb = require('../notification/notificationDb');
const discussDb = require('../discuss/discussDb');

exports.init = function (app) {
    let getRealIp = function (req) {
        if (req._remoteAddress) return req._remoteAddress;
        if (req.ip) return req.ip;
    };

    let version = "local-dev";
    try {
        version = require('./version.js').version;
    } catch (e) {
    }

    let indexHtml = "";
    ejs.renderFile('modules/system/views/index.ejs', {config: config, version: version}, (err, str) => {
        indexHtml = str;
    });

    let homeHtml = "";
    ejs.renderFile('modules/system/views/home-launch.ejs', {config: config, version: version}, (err, str) => {
        homeHtml = str;
    });

    function isModernBrowser(req) {
        let ua = useragent.is(req.headers['user-agent']);
        return ua.chrome || ua.firefox || ua.edge;
    }

    /* for search engine and javascript disabled */
    function isSearchEngine(req) {
        let userAgent = req.headers['user-agent'];
        return userAgent && userAgent.match(/bot|crawler|spider|crawling/gi);
    }

    /* for IE Opera Safari, emit vendor.js */
    let indexLegacyHtml = "";
    ejs.renderFile('modules/system/views/index-legacy.ejs', {config: config, version: version}, (err, str) => {
        indexLegacyHtml = str;
    });

    app.get(["/", "/home"], function (req, res) {
        if (isSearchEngine(req)) res.render('bot/home', 'system');
        else {
            if (req.user || req.query.tour) res.send(isModernBrowser(req) ? indexHtml : indexLegacyHtml);
            else res.send(homeHtml);
        }
    });

    app.get('/tour', (req, res) => res.redirect('/home?tour=yes'));

    app.get('/site-version', (req, res) => res.send(version));

    if (!config.proxy) {
        app.post('/site-version', (req, res) => {
            version = version + ".";
            res.send();
        });
    }

    app.get("/cde/search", (req, res) => {
        let selectedOrg = req.query.selectedOrg;
        let pageString = req.query.page;// starting from 1
        if (!pageString) pageString = "1";
        let isSEO = isSearchEngine(req);
        if (isSEO) {
            if (selectedOrg) {
                let pageNum = _.toInteger(pageString);
                let pageSize = 20;
                let cond = {
                    'classification.stewardOrg.name': selectedOrg,
                    'archived': false,
                    'registrationState.registrationStatus': 'Qualified'
                };
                mongo_cde.DataElement.count(cond, (err, totalCount) => {
                    if (err) {
                        res.status(500).send("ERROR - Static Html Error, /cde/search");
                        logging.errorLogger.error("Error: Static Html Error", {
                            stack: err.stack,
                            origin: req.url
                        });
                    } else
                        mongo_cde.DataElement.find(cond, 'tinyId designations', {
                            skip: pageSize * (pageNum - 1),
                            limit: pageSize
                        }, (err, cdes) => {
                            if (err) {
                                res.status(500).send("ERROR - Static Html Error, /cde/search");
                                logging.errorLogger.error("Error: Static Html Error", {
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
                });
            } else res.render('bot/cdeSearch', 'system');
        } else res.send(isModernBrowser(req) ? indexHtml : indexLegacyHtml);
    });
    app.get("/deView", function (req, res) {
        let tinyId = req.query.tinyId;
        let version = req.query.version;
        mongo_cde.byTinyIdVersion(tinyId, version, (err, cde) => {
            if (err) {
                res.status(500).send("ERROR - Static Html Error, /deView");
                logging.errorLogger.error("Error: Static Html Error", {
                    stack: err.stack,
                    origin: req.url
                });
            } else {
                let isSEO = isSearchEngine(req);
                if (isSEO) res.render('bot/deView', 'system', {elt: cde});
                else res.send(isModernBrowser(req) ? indexHtml : indexLegacyHtml);
            }
        });
    });

    app.get("/form/search", function (req, res) {
        let selectedOrg = req.query.selectedOrg;
        let pageString = req.query.page;// starting from 1
        if (!pageString) pageString = "1";
        let isSEO = isSearchEngine(req);
        if (isSEO) {
            if (selectedOrg) {
                let pageNum = _.toInteger(pageString);
                let pageSize = 20;
                let cond = {
                    'classification.stewardOrg.name': selectedOrg,
                    'archived': false,
                    'registrationState.registrationStatus': 'Qualified'
                };
                mongo_form.Form.count(cond, (err, totalCount) => {
                    if (err) {
                        res.status(500).send("ERROR - Static Html Error, /form/search");
                        logging.errorLogger.error("Error: Static Html Error", {
                            stack: err.stack,
                            origin: req.url
                        });
                    } else
                        mongo_form.Form.find(cond, 'tinyId designations', {
                            skip: pageSize * (pageNum - 1),
                            limit: pageSize
                        }, (err, forms) => {
                            if (err) {
                                res.status(500).send("ERROR - Static Html Error, /form/search");
                                logging.errorLogger.error("Error: Static Html Error", {
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
                });
            } else res.render('bot/formSearch', 'system');
        } else res.send(isModernBrowser(req) ? indexHtml : indexLegacyHtml);
    });

    app.get("/formView", function (req, res) {
        let tinyId = req.query.tinyId;
        let version = req.query.version;
        mongo_form.byTinyIdVersion(tinyId, version, (err, cde) => {
            if (err) {
                res.status(500).send("ERROR - Static Html Error, /formView");
                logging.errorLogger.error("Error: Static Html Error", {
                    stack: err.stack,
                    origin: req.url
                });
            } else {
                let isSEO = isSearchEngine(req);
                if (isSEO) res.render('bot/formView', 'system', {elt: cde});
                else res.send(isModernBrowser(req) ? indexHtml : indexLegacyHtml);
            }
        });
    });


    new CronJob('00 00 4 * * *', () => meshElastic.syncWithMesh(), null, true, 'America/New_York');

    // every sunday at 4:07 AM
    new CronJob('* 7 4 * * 6', () => {
        dbLogger.consoleLog("Creating sitemap");
        let wstream = fs.createWriteStream('./dist/app/sitemap.txt');
        let cond = {
            'archived': false,
            'registrationState.registrationStatus': 'Qualified'
        };
        async.series([
            cb => {
                let stream = mongo_cde.DataElement.find(cond, "tinyId").stream();
                let formatter = doc => config.publicUrl + "/deView?tinyId=" + doc.tinyId + "\n";
                stream.on('data', doc => wstream.write(formatter(doc)));
                stream.on('err', err => cb(err));
                stream.on('end', cb);
            },
            cb => {
                let stream = mongo_form.Form.find(cond, "tinyId").stream();
                let formatter = doc => config.publicUrl + "/formView?tinyId=" + doc.tinyId + "\n";
                stream.on('data', doc => wstream.write(formatter(doc)));
                stream.on('err', err => cb(err));
                stream.on('end', cb);
            }
        ], err => {
            if (err) {
                logging.errorLogger.error("Error generating sitemap", {
                    stack: err.stack,
                    origin: req.url
                });
            }
            dbLogger.consoleLog("done with sitemap");
            wstream.end();
        });
    }, null, true, 'America/New_York', this, true);

    ["/help/:title", "/createForm", "/createCde", "/boardList",
        "/board/:id", "/myboards", "/sdcview", "/cdeStatusReport", "/api", "/sdcview", "/404", "whatsNew",
        "/quickBoard", "/searchPreferences", "/siteAudit", "/siteaccountmanagement", "/orgaccountmanagement",
        "/classificationmanagement", "/inbox", "/profile", "/login", "/orgAuthority", '/orgComments'].forEach(path => {
        app.get(path, (req, res) => res.send(isModernBrowser(req) ? indexHtml : indexLegacyHtml));
    });

    app.get('/fhir/launch/:param', (req, res) => {
        res.sendFile(path.join(__dirname, '../../modules/_fhirApp', 'fhirAppLaunch.html'), undefined, err => {
            if (err) res.sendStatus(404);
        });
    });

    app.get('/fhir/form/:param', (req, res) => {
        res.sendFile(path.join(__dirname, '../../modules/_fhirApp', 'fhirApp.html'), undefined, err => {
            if (err) res.sendStatus(404);
        });
    });

    app.get('/fhirObservationInfo', (req, res) => {
        fhirObservationInfo.get(res, req.query.id, info => res.send(info));
    });

    app.put('/fhirObservationInfo', [authorization.loggedInMiddleware], (req, res) => {
        fhirObservationInfo.put(res, req.body, info => res.send(info));
    });

    app.get('/nativeRender', (req, res) => {
        res.sendFile(path.join(__dirname, '../../modules/_nativeRenderApp', 'nativeRenderApp.html'), undefined, err => {
            if (err) res.sendStatus(404);
        });
    });

    app.get('/sw.js', function (req, res) {
        res.sendFile(path.join(__dirname, '../../dist/app', 'sw.js'), undefined, err => {
            if (err) res.sendStatus(404);
        });
    });

    pushNotification.checkDatabase();
    app.post('/pushRegistration', [authorization.loggedInMiddleware], pushNotification.create);
    app.delete('/pushRegistration', [authorization.loggedInMiddleware], pushNotification.delete);
    app.post('/pushRegistrationSubscribe', [authorization.loggedInMiddleware], pushNotification.subscribe);
    app.post('/pushRegistrationUpdate', pushNotification.updateStatus);

    app.get('/jobStatus/:type', function (req, res) {
        let jobType = req.params.type;
        if (!jobType) return res.status(400).end();
        mongo_data.jobStatus(jobType, (err, j) => {
            if (err) return res.status(409).send("Error - job status " + jobType);
            if (j) return res.send({done: false});
            res.send({done: true});
        });
    });
    app.get('/identifierSources/cde', (req, res) => {
        cdeElastic.DataElementDistinct("ids.source", result => res.send(result));
    });
    app.get('/identifierSources/form', (req, res) => {
        formElastic.FormDistinct("ids.source", result => res.send(result));
    });

    app.get('/identifierSources/', (req, res) => {
        cdeElastic.DataElementDistinct("ids.source", result1 =>
            formElastic.FormDistinct("ids.source", result2 => res.send(_.union(result1, result2))));
    });

    /* ---------- PUT NEW REST API above ---------- */

    app.get('/indexCurrentNumDoc/:indexPosition', [authorization.isSiteAdminMiddleware], (req, res) => {
        let index = esInit.indices[req.params.indexPosition];
        return res.send({count: index.count, totalCount: index.totalCount});
    });

    app.post('/reindex/:indexPosition', [authorization.isSiteAdminMiddleware], (req, res) => {
        let index = esInit.indices[req.params.indexPosition];
        elastic.reIndex(index, () => {
            setTimeout(() => {
                index.count = 0;
                index.totalCount = 0;
            }, 5000);
        });
        return res.send('Re-index request sent.');
    });



    app.get('/supportedBrowsers', (req, res) => res.render('supportedBrowsers', 'system'));

    app.get('/listOrgs', exportShared.nocacheMiddleware, (req, res) => {
        mongo_data.listOrgs(function (err, orgs) {
            if (err) return res.status(500).send('ERROR - unable to list orgs');
            res.send(orgs);
        });
    });

    app.get('/listOrgsDetailedInfo', exportShared.nocacheMiddleware, (req, res) => {
        mongo_data.listOrgsDetailedInfo(function (err, orgs) {
            if (err) {
                logging.errorLogger.error(JSON.stringify({msg: 'Failed to get list of orgs detailed info.'}),
                    {stack: new Error().stack});
                return res.status(403).send('Failed to get list of orgs detailed info.');
            }
            res.send(orgs);
        });
    });

    app.get('/loginText', csrf(), (req, res) => res.render("loginText", "system", {csrftoken: req.csrfToken()}));

    let failedIps = [];

    app.get('/csrf', csrf(), (req, res) => {
        exportShared.nocacheMiddleware(req, res);
        let resp = {csrf: req.csrfToken()};
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
            traffic.banIp(getRealIp(req), "Invalid Login body");
            return res.status(401).send();
        }
        if (Object.keys(req.query).length) {
            traffic.banIp(getRealIp(req), "Passing params to /login");
            return res.status(401).send();
        }
        return next();
    }

    const validLoginBody = ["username", "password", "_csrf", "recaptcha"];

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
                    passport.authenticate('local', (err, user) => {
                        if (err) return res.status(403).end();
                        if (!user) {
                            if (failedIp && config.useCaptcha) failedIp.nb++;
                            else {
                                failedIps.unshift({ip: getRealIp(req), nb: 1});
                                failedIps.length = 50;
                            }
                            return res.status(403).send();
                        }
                        req.logIn(user, err => {
                            if (err) return res.status(403).end();
                            req.session.passport = {user: req.user._id};
                            return res.send("OK");
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

    app.get('/org/:name', exportShared.nocacheMiddleware, (req, res) => {
        return mongo_data.orgByName(req.params.name, (err, result) => res.send(result));
    });


    app.get('/managedOrgs', orgsvc.managedOrgs);
    app.post('/addOrg', [authorization.isOrgAuthorityMiddleware], orgsvc.addOrg);
    app.post('/updateOrg', [authorization.isOrgAuthorityMiddleware], (req, res) => mongo_data.updateOrg(req.body, res));

    app.get('/user/:search', [exportShared.nocacheMiddleware, authorization.loggedInMiddleware], (req, res) => {
        if (!req.params.search) {
            return res.send({});
        } else if (req.params.search === 'me') {
            mongo_data.userById(req.user._id, handleError({req, res}, user => res.send(user)));
        } else {
            mongo_data.usersByName(req.params.search, handleError({req, res}, users => res.send(users)));
        }
    });

    app.get('/myOrgsAdmins', [exportShared.nocacheMiddleware, authorization.loggedInMiddleware], usersrvc.myOrgsAdmins);

    app.get('/orgAdmins', [exportShared.nocacheMiddleware, authorization.isOrgAuthorityMiddleware], usersrvc.orgAdmins);
    app.post('/addOrgAdmin', [authorization.isOrgAdminMiddleware], usersrvc.addOrgAdmin);
    app.post('/removeOrgAdmin', [authorization.isOrgAdminMiddleware], usersrvc.removeOrgAdmin);

    app.get('/orgCurators', [exportShared.nocacheMiddleware, authorization.isOrgAdminMiddleware], usersrvc.orgCurators);
    app.post('/addOrgCurator', [authorization.isOrgAdminMiddleware], usersrvc.addOrgCurator);
    app.post('/removeOrgCurator', [authorization.isOrgAdminMiddleware], usersrvc.removeOrgCurator);

    app.post('/updateUserRoles', [authorization.isOrgAuthorityMiddleware], usersrvc.updateUserRoles);
    app.post('/updateUserAvatar', [authorization.isOrgAuthorityMiddleware], usersrvc.updateUserAvatar);

    app.get('/data/:imgtag', (req, res) => {
        mongo_data.getFile(req.user, req.params.imgtag, res);
    });

    app.post('/transferSteward', (req, res) => {
        orgsvc.transferSteward(req, res);
    });

    app.post('/mail/messages/new', [authorization.loggedInMiddleware], (req, res) => {
        let message = req.body;
        if (message.author.authorType === "user") message.author.name = req.user.username;
        message.date = new Date();
        mongo_data.createMessage(message, () => res.send());
    });

    app.post('/mail/messages/update', [authorization.loggedInMiddleware], (req, res) => {
        mongo_data.updateMessage(req.body, err => {
            if (err) {
                res.statusCode = 404;
                res.send("Error while updating the message");
            }
            res.send();
        });
    });

    app.post('/mail/messages/:type', [authorization.loggedInMiddleware], (req, res) => {
        mongo_data.getMessages(req, (err, messages) => {
            if (err) return res.status(404).send(err);
            res.send(messages);
        });
    });

    app.get('/tasks/:clientVersion', [authorization.loggedInMiddleware], (req, res) => {
        // mongo_data.taskGetByUser
        let client = -1;
        let server = -1;
        let comments;
        let tasks = [];
        if (authorizationShared.isSiteAdmin(req.user)) {
            notificationDb.getNumberClientError(req.user, handleError({req, res}, clientErrorCount => {
                client = clientErrorCount;
                tasksDone();
            }));
            notificationDb.getNumberServerError(req.user, handleError({req, res}, serverErrorCount => {
                server = serverErrorCount;
                tasksDone();
            }));
        } else {
            client = 0;
            server = 0;
            tasksDone();
        }
        // TODO: implement org boundaries
        if (authorizationShared.canComment(req.user) && req.user.notifications) { // required, req.user.notifications.approvalComment.drawer not used
            discussDb.unapprovedMessages(handleError({req, res}, c => {
                comments = c;
                tasksDone();
            }));
        } else {
            comments = [];
            tasksDone();
        }

        function pending(comment) {
            let pending = [];
            if (comment.pendingApproval) {
                pending.push(comment);
            }
            if (Array.isArray(comment.replies)) {
                pending = pending.concat(comment.replies.filter(r => r.pendingApproval));
            }
            return pending;
        }
        function tasksDone() {
            if (client === -1 || server === -1 || !comments) {
                return;
            }
            if (version !== req.params.clientVersion) {
                tasks.push({
                    _id: 'version',
                    name: 'Website Updated',
                    text: 'A new version of this site is available. To enjoy the new features, please close all CDE tabs then load again.',
                    type: 'error',
                });
            }
            if (client > 0) {
                tasks.push({
                    _id: 'client',
                    name: client + ' New Client Errors',
                    properties: [
                        {key: 'Audit Client Errors', link: '/siteAudit', linkParams: {tab:'clientError'}}
                    ],
                });
            }
            if (server > 0) {
                tasks.push({
                    _id: 'server',
                    name: server + ' New Server Errors',
                    properties: [
                        {key: 'Audit Server Errors', link: '/siteAudit', linkParams: {tab:'serverError'}}
                    ],
                });
            }
            if (Array.isArray(comments)) {
                comments.forEach(c => {
                    pending(c).forEach(p => {
                        let uri = c.element && (
                            c.element.eltType === 'board' && '/board' ||
                            c.element.eltType === 'cde' && '/deView' ||
                            c.element.eltType === 'form' && '/formView' ||
                            undefined
                        );
                        tasks.push({
                            _id: p._id,
                            name: 'comment',
                            properties: [
                                {key: 'User', value: p.user && p.user.username || c.user && c.user.username},
                                {key: 'Form', value: c.element && c.element.eltId, link: uri, linkParams: c.element && {tinyId: c.element.eltId}}
                            ],
                            reply: p !== c,
                            text: p.text,
                            type: 'approval',
                        });
                    });
                });
            }
            res.send(tasks);
        }
    });

    app.post('/addUserRole', [authorization.canApproveCommentMiddleware], (req, res) => {
        mongo_data.addUserRole(req.body, handleError({req, res}, () => {
            res.send();
        }));
    });

    // @TODO this should be POST
    app.get('/attachment/approve/:id', (req, res) => {
        if (!authorizationShared.hasRole(req.user, "AttachmentReviewer")) return res.status(401).send();
        mongo_data.alterAttachmentStatus(req.params.id, "approved", err => {
            if (err) return res.status(500).send("Unable to approve attachment");
            res.send("Attachment approved.");
        });
    });

    app.get('/attachment/decline/:id', (req, res) => {
        if (!authorizationShared.hasRole(req.user, "AttachmentReviewer")) return res.status(401).send();
        daoManager.getDaoList().forEach(dao => {
            if (dao.removeAttachmentLinks) dao.removeAttachmentLinks(req.params.id);
        });
        mongo_data.deleteFileById(req.params.id);
        res.send("Attachment declined");
    });

    app.post('/getClassificationAuditLog', (req, res) => {
        if (authorizationShared.isOrgAuthority(req.user)) {
            mongo_data.getClassificationAuditLog(req.body, (err, result) => {
                if (err) return res.status(500).send();
                res.send(result);
            });
        } else res.status(401).send("Not Authorized");
    });

    app.post('/embed/', [authorization.isOrgAdminMiddleware], (req, res) => {
        mongo_data.embeds.save(req.body, handleError({
            req,
            res,
            publicMessage: 'There was an error saving this embed.'
        }, embed =>
            res.send(embed)));
    });

    app.delete('/embed/:id', [authorization.loggedInMiddleware], (req, res) => {
        const errorOptions = {req, res, publicMessage: 'There was an error removing this embed.'};
        mongo_data.embeds.find({_id: req.params.id}, handleError(errorOptions, embeds => {
            if (embeds.length !== 1) {
                res.status.send("Expectation not met: one document.");
                return;
            }
            if (!req.isAuthenticated() || !authorizationShared.isOrgAdmin(req.user, embeds[0].org)) {
                res.status(401).send();
                return;
            }
            mongo_data.embeds.delete(req.params.id, handleError(errorOptions, () => res.send()));
        }));
    });

    app.get('/embed/:id', (req, res) => {
        mongo_data.embeds.find({_id: req.params.id}, (err, embeds) => {
            if (err) return res.status(500).send();
            if (embeds.length !== 1) return res.status.send("Expectation not met: one document.");
            res.send(embeds[0]);
        });

    });

    app.get('/embeds/:org', (req, res) => {
        mongo_data.embeds.find({org: req.params.org}, (err, embeds) => {
            if (err) return res.status(500).send();
            res.send(embeds);
        });
    });

    app.get('/fhirApps', (req, res) => fhirApps.find(res, {}, apps => res.send(apps)));
    app.get('/fhirApp/:id', (req, res) => fhirApps.find(res, {_id: req.params.id}, apps => res.send(apps[0])));
    app.post('/fhirApp', [authorization.isSiteAdminMiddleware], (req, res) => fhirApps.put(res, req.body, app => res.send(app)));
    app.delete('/fhirApp/:id', [authorization.isSiteAdminMiddleware], (req, res) => fhirApps.delete(res, req.params.id, () => res.send()));

    app.post('/disableRule', (req, res) => {
        if (!authorizationShared.isOrgAuthority(req.user)) return res.status(403).send("Not Authorized");
        mongo_data.disableRule(req.body, function (err, org) {
            if (err) return res.status(500).send(org);
            res.send(org);
        });
    });

    app.post('/enableRule', (req, res) => {
        if (!authorizationShared.isOrgAuthority(req.user)) return res.status(403).send("Not Authorized");
        mongo_data.enableRule(req.body, (err, org) => {
            if (err) return res.status(500).send(org);
            res.send(org);
        });
    });

    app.get('/activeBans', (req, res) => {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            traffic.getTrafficFilter(list => res.send(list));
        } else res.status(401).send();
    });

    app.post('/removeBan', (req, res) => {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            traffic.getTrafficFilter(elt => {
                let foundIndex = elt.ipList.findIndex(r => r.ip === req.body.ip);
                if (foundIndex > -1) {
                    elt.ipList.splice(foundIndex, 1);
                    elt.save(() => res.send());
                } else res.send();
            });
        } else res.status(401).send();
    });

    app.get('/allDrafts', (req, res) => {
        if (req.user && req.user.siteAdmin) {
            mongo_cde.draftsList({}, (err, draftCdes) => {
                if (err) return res.status(500).send("Error Retrieving Draft CDEs");
                mongo_form.draftsList({}, (err, draftForms) => {
                    if (err) return res.status(500).send("Error Retrieving Draft Forms");
                    res.send({draftCdes: draftCdes, draftForms: draftForms});
                });
            });
        } else res.status(401).send();
    });

    app.get('/orgDrafts', (req, res) => {
        if (authorizationShared.isOrgCurator(req.user)) {
            mongo_cde.draftsList({"stewardOrg.name": {$in: usersrvc.myOrgs(req.user)}}, (err, draftCdes) => {
                if (err) return res.status(500).send("Error Retrieving Draft CDEs");
                mongo_form.draftsList({"stewardOrg.name": {$in: usersrvc.myOrgs(req.user)}}, (err, draftForms) => {
                    if (err) return res.status(500).send("Error Retrieving Draft Forms");
                    return res.send({draftCdes: draftCdes, draftForms: draftForms});
                });
            });
        } else res.status(401).send();
    });

    app.get('/myDrafts', (req, res) => {
        if (authorizationShared.isOrgCurator(req.user)) {
            mongo_cde.draftsList({"updatedBy.username": req.user.username}, (err, draftCdes) => {
                if (err) return res.status(500).send("Error Retrieving Draft CDEs");
                mongo_form.draftsList({"updatedBy.username": req.user.username}, (err, draftForms) => {
                    if (err) return res.status(500).send("Error Retrieving Draft Forms");
                    res.send({draftCdes: draftCdes, draftForms: draftForms});
                });
            });
        } else res.status(401).send();
    });

};
