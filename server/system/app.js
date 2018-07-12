const async = require('async');
const CronJob = require('cron').CronJob;
const csrf = require('csurf');
const ejs = require('ejs');
const fs = require('fs');
const _ = require('lodash');
const passport = require('passport');
const path = require('path');
const request = require('request');
const useragent = require('useragent');
const authorization = require('./authorization');
const authorizationShared = require('@std/esm')(module)("../../shared/system/authorizationShared");
const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const mongo_data = require('./mongo-data');
const config = require('./parseConfig');
const dbLogger = require('../log/dbLogger.js');
const handleError = require('../log/dbLogger.js').handleError;
const logging = require('./logging.js');
const orgsvc = require('./orgsvc');
const pushNotification = require('./pushNotification');
const usersrvc = require('./usersrvc');
const orgClassificationSvc = require('./orgClassificationSvc');
const adminItemSvc = require("./adminItemSvc");
const daoManager = require('./moduleDaoManager');
const exportShared = require('@std/esm')(module)('../../shared/system/exportShared');
const esInit = require('./elasticSearchInit');
const elastic = require('./elastic.js');
const fhirApps = require('./fhir').fhirApps;
const fhirObservationInfo = require('./fhir').fhirObservationInfo;
const cdeElastic = require('../cde/elastic.js');
const formElastic = require('../form/elastic.js');
const app_status = require("./status.js");
const traffic = require('./traffic');


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

    app.get("/site-version", (req, res) => res.send(version));

    if (!config.proxy) {
        app.post("/site-version", (req, res) => {
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

    // every sunday at 4:07 AM
    new CronJob('* 7 4 * * 6',
        () => {
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
        "/board/:id", "/myboards", "/sdcview", "/cdeStatusReport", "/api", "/sdcview", "/404",
        "/quickBoard", "/searchPreferences", "/siteAudit", "/siteaccountmanagement", "/orgaccountmanagement",
        "/classificationmanagement", "/inbox", "/profile", "/login", "/orgAuthority", '/orgComments'].forEach(path => {
        app.get(path, (req, res) => res.send(isModernBrowser(req) ? indexHtml : indexLegacyHtml));
    });

    app.get('/fhir/form/:param', (req, res) => {
        res.sendFile(path.join(__dirname, '../../modules/_fhirApp', 'fhirApp.html'), undefined, err => {
            if (err) res.sendStatus(404);
        });
    });

    app.get('/fhirObservationInfo', (req, res) => {
        fhirObservationInfo.get(res, req.query.id, data =>
            res.send(data));
    });

    app.put('/fhirObservationInfo', [authorization.loggedInMiddleware], (req, res) => {
        fhirObservationInfo.put(res, req.body, data =>
            res.send(data));
    });

    app.get('/nativeRender', (req, res) => {
        res.sendFile(path.join(__dirname, '../../modules/_nativeRenderApp', 'nativeRenderApp.html'), undefined, err => {
            if (err) res.sendStatus(404);
        });
    });

    app.get('/sw.js', function (req, res) {
        res.sendFile(path.join(__dirname, '../../dist/app', 'sw.js'), undefined, err => {
            if (err) {
                res.sendStatus(404);
            }
        });
    });

    pushNotification.checkDatabase();
    app.post('/pushRegistration', [authorization.loggedInMiddleware], pushNotification.create);
    app.delete('/pushRegistration', [authorization.loggedInMiddleware], pushNotification.delete);
    app.post('/pushRegistrationSubscribe', [authorization.loggedInMiddleware], pushNotification.subscribe);
    app.post('/pushRegistrationUpdate', pushNotification.updateStatus);

    // @TODO: classification to own file
    // delete org classification
    app.post('/orgClassificationDelete/', (req, res) => {
        let deleteClassification = req.body.deleteClassification;
        let settings = req.body.settings;
        if (!deleteClassification || !settings) return res.status(400).send();
        if (!authorizationShared.isOrgCurator(req.user, deleteClassification.orgName)) return res.status(403).end();
        mongo_data.jobStatus("deleteClassification", (err, j) => {
            if (err) return res.status(409).send("Error - delete classification is in processing, try again later.");
            if (j) return res.status(401).send();
            orgClassificationSvc.deleteOrgClassification(req.user, deleteClassification, settings, err => {
                if (err) dbLogger.logError(err);
            });
            res.send("Deleting in progress.");
        });
    });

    // rename org classification
    app.post('/orgClassification/rename', function (req, res) {
        let newClassification = req.body.newClassification;
        let newName = req.body.newClassification.newName;
        let settings = req.body.settings;
        if (!newName || !newClassification || !settings) return res.status(400).send();
        if (!authorizationShared.isOrgCurator(req.user, newClassification.orgName)) return res.status(403).end();
        mongo_data.jobStatus("renameClassification", (err, j) => {
            if (err) return res.status(409).send("Error - rename classification is in processing, try again later.");
            if (j) return res.status(401).send();
            orgClassificationSvc.renameOrgClassification(req.user, newClassification, settings, err => {
                if (err) dbLogger.logError(err);
            });
            res.send("Renaming in progress.");
        });
    });

    // add org classification
    app.put('/orgClassification/', function (req, res) {
        let newClassification = req.body.newClassification;
        if (!newClassification) return res.status(400).send();
        if (!authorizationShared.isOrgCurator(req.user, newClassification.orgName)) return res.status(403).end();
        mongo_data.jobStatus("addClassification", (err, j) => {
            if (err) return res.status(409).send("Error - delete classification is in processing, try again later.");
            if (j) return res.status(401).send();
            orgClassificationSvc.addOrgClassification(newClassification, err => {
                if (err) res.status(500).send(err);
                else res.send("Classification added.");
            });
        });
    });

    // reclassify org classification
    app.post('/orgReclassification', function (req, res) {
        let oldClassification = req.body.oldClassification;
        let newClassification = req.body.newClassification;
        let settings = req.body.settings;
        if (!oldClassification || !newClassification || !settings) return res.status(400).send();
        if (!authorizationShared.isOrgCurator(req.user, newClassification.orgName)) return res.status(403).end();
        mongo_data.jobStatus("reclassifyClassification", (err, j) => {
            if (err) return res.status(409).send("Error - reclassify classification is in processing, try again later.");
            if (j) return res.status(401).send();
            orgClassificationSvc.reclassifyOrgClassification(req.user, oldClassification, newClassification, settings, err => {
                if (err) logging.log(err);
            });
            res.send("Reclassifying in progress.");
        });

    });

    app.get('/jobStatus/:type', function (req, res) {
        let jobType = req.params.type;
        if (!jobType) return res.status(400).end();
        mongo_data.jobStatus(jobType, (err, j) => {
            if (err) res.status(409).send("Error - job status " + jobType);
            if (j) return res.send({done: false});
            else res.send({done: true});
        });
    });
    app.get('/identifierSources/cde', (req, res) => {
        cdeElastic.DataElementDistinct("ids.source", function (result) {
            res.send(result);
        });
    });
    app.get('/identifierSources/form', (req, res) => {
        formElastic.FormDistinct("ids.source", function (result) {
            res.send(result);
        });
    });

    app.get('/identifierSources/', (req, res) => {
        cdeElastic.DataElementDistinct("ids.source", function (result1) {
            formElastic.FormDistinct("ids.source", function (result2) {
                res.send(_.union(result1, result2));
            });
        });
    });

    /* ---------- PUT NEW REST API above ---------- */

    app.get('/indexCurrentNumDoc/:indexPosition', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            let index = esInit.indices[req.params.indexPosition];
            res.status(200).send({count: index.count, totalCount: index.totalCount});
        } else {
            res.status(401).send();
        }
    });

    app.post('/reindex/:indexPosition', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            let index = esInit.indices[req.params.indexPosition];
            elastic.reIndex(index, function () {
                setTimeout(function () {
                    index.count = 0;
                    index.totalCount = 0;
                }, 5000);
            });
            res.send("Re-index request sent.");
        } else {
            res.status(401).send();
        }
    });

    app.get('/serverStatuses', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            app_status.getStatus(function () {
                mongo_data.getClusterHostStatuses(function (err, statuses) {
                    res.send({esIndices: esInit.indices, statuses: statuses});
                });
            });
        } else {
            res.status(401).send();
        }
    });

    app.get("/supportedBrowsers", function (req, res) {
        res.render('supportedBrowsers', 'system');
    });

    app.get('/listOrgs', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data.listOrgs(function (err, orgs) {
            if (err) return res.status(500).send("ERROR - unable to list orgs");
            res.send(orgs);
        });
    });

    app.get('/listOrgsDetailedInfo', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data.listOrgsDetailedInfo(function (err, orgs) {
            if (err) {
                logging.errorLogger.error(JSON.stringify({msg: 'Failed to get list of orgs detailed info.'}));
                res.status(403).send('Failed to get list of orgs detailed info.');
            } else res.send(orgs);
        });
    });

    app.get('/loginText', csrf(), function (req, res) {
        let token = req.csrfToken();
        res.render("loginText", "system", {csrftoken: token});
    });

    let failedIps = [];

    app.get('/csrf', csrf(), function (req, res) {
        exportShared.nocacheMiddleware(req, res);
        let resp = {csrf: req.csrfToken()};
        let failedIp = findFailedIp(getRealIp(req));
        if ((failedIp && failedIp.nb > 2)) {
            resp.showCaptcha = true;
        }
        res.send(resp);
    });

    function findFailedIp(ip) {
        return failedIps.filter(function (f) {
            return f.ip === ip;
        })[0];
    }

    function myCsrf(req, res, next) {
        if (!req.body._csrf) return res.status(401).send();
        csrf()(req, res, next);
    }

    const validLoginBody = ["username", "password", "_csrf", "recaptcha"];
    app.post('/login', myCsrf, (req, res, next) => {
        if (Object.keys(req.body).filter(k => validLoginBody.indexOf(k) === -1).length) {
            traffic.banIp(getRealIp(req), "Invalid Login body");
            return res.status(401).send();
        }
        if (req.params.length) {
            traffic.banIp(getRealIp(req), "Passing params to /login");
            return res.status(401).send();
        }

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
                    passport.authenticate('local', function (err, user) {
                        if (err) return res.status(403).end();
                        if (!user) {
                            if (failedIp && config.useCaptcha) failedIp.nb++;
                            else {
                                failedIps.unshift({ip: getRealIp(req), nb: 1});
                                failedIps.length = 50;
                            }
                            return res.status(403).send();
                        }
                        req.logIn(user, function (err) {
                            if (err) return res.status(403).end();
                            req.session.passport = {user: req.user._id};
                            return res.send("OK");
                        });
                    })(req, res, next);
                });
            });
    });

    app.post('/logout', function (req, res) {
        if (!req.session) return res.status(403).end();
        req.session.destroy(function () {
            req.logout();
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    });

    app.get('/org/:name', exportShared.nocacheMiddleware, function (req, res) {
        return mongo_data.orgByName(req.params.name, function (err, result) {
            res.send(result);
        });
    });

    app.get('/usernamesByIp/:ip', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            return mongo_data.usernamesByIp(req.params.ip, function (err, result) {
                if (err) return res.status(500).send("Error retrieving username by IP");
                else res.send(result);
            });
        } else {
            res.status(401).send();
        }
    });


    app.get('/siteAdmins', [authorization.isSiteAdminMiddleware], (req, res) => {
        mongo_data.siteAdmins((err, users) => res.send(users));
    });

    app.get('/orgAuthorities', [authorization.isSiteAdminMiddleware], (req, res) => {
        mongo_data.orgAuthorities((err, users) => res.send(users));
    });

    app.get('/managedOrgs', function (req, res) {
        orgsvc.managedOrgs(req, res);
    });

    app.post('/addOrg', function (req, res) {
        if (authorizationShared.canOrgAuthority(req.user)) {

            orgsvc.addOrg(req, res);
        } else {
            res.status(401).send();
        }
    });

    app.post('/updateOrg', function (req, res) {
        if (authorizationShared.canOrgAuthority(req.user)) {
            mongo_data.updateOrg(req.body, res);
        } else {
            res.status(401).send();
        }
    });

    app.get('/user/:search', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.user) return res.send({});
        else if (!req.params.search) {
            return res.send({});
        } else if (req.params.search === 'me') {
            mongo_data.userById(req.user._id, function (err, user) {
                if (err) return res.status(500).send("ERROR retrieve user by id");
                res.send(user);
            });
        } else {
            mongo_data.usersByName(req.params.search, function (err, users) {
                if (err) return res.status(500).send("ERROR getting user by name");
                res.send(users);
            });
        }
    });

    app.post('/addSiteAdmin', [authorization.isSiteAdminMiddleware], usersrvc.addSiteAdmin);
    app.post('/removeSiteAdmin', [authorization.isSiteAdminMiddleware], usersrvc.removeSiteAdmin);

    app.get('/myOrgsAdmins', [exportShared.nocacheMiddleware], usersrvc.myOrgsAdmins);

    app.get('/orgAdmins', [exportShared.nocacheMiddleware], usersrvc.orgAdmins);
    app.post('/addOrgAdmin', [authorization.isOrgAdminMiddleware], usersrvc.addOrgAdmin);
    app.post('/removeOrgAdmin', [authorization.isOrgAdminMiddleware], usersrvc.removeOrgAdmin);

    app.get('/orgCurators', [exportShared.nocacheMiddleware], usersrvc.orgCurators);
    app.post('/addOrgCurator', [authorization.isOrgAdminMiddleware], usersrvc.addOrgCurator);
    app.post('/removeOrgCurator', [authorization.isOrgAdminMiddleware], usersrvc.removeOrgCurator);

    app.post('/updateUserRoles', [authorization.isOrgAuthorityMiddleware], (req, res) => {
        usersrvc.updateUserRoles(req.body, handleError({req, res}, () => {
            res.status(200).end();
        }));
    });

    app.post('/updateUserAvatar', [authorization.isOrgAuthorityMiddleware], (req, res) => {
        usersrvc.updateUserAvatar(req.body, handleError({req, res}, () => {
            res.status(200).end();
        }));
    });

    app.get('/siteaccountmanagement', [exportShared.nocacheMiddleware, authorization.isSiteAdminMiddleware], (req, res) => {
            res.render('siteaccountmanagement', "system");
    });

    app.get('/orgaccountmanagement', exportShared.nocacheMiddleware, function (req, res) {
        res.render('orgAccountManagement', "system");
    });

    app.get('/data/:imgtag', function (req, res) {
        mongo_data.getFile(req.user, req.params.imgtag, res);
    });

    app.post('/transferSteward', function (req, res) {
        orgsvc.transferSteward(req, res);
    });

    // TODO this works only for CDEs. Forms TODO later.
    app.post('/classification/bulk/tinyId', function (req, res) {
        if (!authorizationShared.isOrgCurator(req.user, req.body.orgName)) return res.status(403).send("Not Authorized");
        if (!req.body.orgName || !req.body.categories) return res.status(400).send("Bad Request");
        let elements = req.body.elements;
        if (elements.length <= 50)
            adminItemSvc.bulkClassifyCdes(req.user, req.body.eltId, elements, req.body, handleError({req, res}, () => {
                res.send("Done");
            }));
        else {
            res.send("Processing");
            adminItemSvc.bulkClassifyCdes(req.user, req.body.eltId, elements, req.body);
        }
        mongo_data.addToClassifAudit({
            date: new Date(),
            user: {
                username: req.user.username
            },
            elements: elements,
            action: "add",
            path: [req.body.orgName].concat(req.body.categories)
        });
    });

    app.get("/bulkClassifyCdeStatus/:eltId", function (req, res) {
        let formId = req.param("eltId");
        if (!formId) return res.status(400).send("Bad Request");
        let result = adminItemSvc.bulkClassifyCdesStatus[req.user.username + req.params.eltId];
        if (result) res.send(result);
        else res.send({});
    });

    app.get("/resetBulkClassifyCdesStatus/:eltId", function (req, res) {
        let formId = req.param("eltId");
        if (!formId) return res.status(400).send("Bad Request");
        adminItemSvc.resetBulkClassifyCdesStatus(req.user.username + req.param("eltId"));
        res.end();
    });


    app.post('/mail/messages/new', function (req, res) {
        if (req.isAuthenticated()) {
            let message = req.body;
            if (message.author.authorType === "user") {
                message.author.name = req.user.username;
            }
            message.date = new Date();
            mongo_data.createMessage(message, function () {
                res.send();
            });
        } else {
            res.status(401).send();
        }
    });

    app.post('/mail/messages/update', function (req, res) {
        if (req.isAuthenticated()) {
            mongo_data.updateMessage(req.body, function (err) {
                if (err) {
                    res.statusCode = 404;
                    res.send("Error while updating the message");
                } else res.send();
            });
        } else res.status(401).send();
    });

    app.post('/mail/messages/:type', function (req, res) {
        if (req.isAuthenticated()) {
            mongo_data.getMessages(req, function (err, messages) {
                if (err) res.status(404).send(err);
                else res.send(messages);
            });
        } else {
            res.status(401).send("Not Authorized");
        }
    });

    app.post('/addUserRole', function (req, res) {
        if (authorizationShared.hasRole(req.user, "CommentReviewer")) {
            mongo_data.addUserRole(req.body, function (err) {
                if (err) {
                    dbLogger.logError({
                        message: 'Error adding user role',
                        origin: '/addUserRole',
                        stack: err,
                        details: ''
                    });
                    res.status(500).send('Error adding user role');
                }
                else res.send("Role added.");
            });
        }
    });

    // @TODO this should be POST
    app.get('/attachment/approve/:id', function (req, res) {
        if (!authorizationShared.hasRole(req.user, "AttachmentReviewer")) return res.status(401).send();
        mongo_data.alterAttachmentStatus(req.params.id, "approved", function (err) {
            if (err) res.status(500).send("Unable to approve attachment");
            else res.send("Attachment approved.");
        });
    });

    app.get('/attachment/decline/:id', function (req, res) {
        if (!authorizationShared.hasRole(req.user, "AttachmentReviewer")) return res.status(401).send();
        daoManager.getDaoList().forEach(function (dao) {
            if (dao.removeAttachmentLinks)
                dao.removeAttachmentLinks(req.params.id);
        });
        mongo_data.deleteFileById(req.params.id);
        res.send("Attachment declined");
    });

    app.post('/getClassificationAuditLog', function (req, res) {
        if (authorizationShared.canOrgAuthority(req.user)) {
            mongo_data.getClassificationAuditLog(req.body, function (err, result) {
                if (err) return res.status(500).send();
                res.send(result);
            });
        } else {
            res.status(401).send("Not Authorized");
        }
    });

    app.post('/embed/', [authorization.isOrgAdminMiddleware], function (req, res) {
        mongo_data.embeds.save(req.body, handleError({req, res, publicMessage: 'There was an error saving this embed.'}, embed =>
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
            mongo_data.embeds.delete(req.params.id, handleError(errorOptions, () =>
                res.send()));
        }));
    });


    app.get('/embed/:id', function (req, res) {
        mongo_data.embeds.find({_id: req.params.id}, function (err, embeds) {
            if (err) return res.status(500).send();
            if (embeds.length !== 1) return res.status.send("Expectation not met: one document.");
            else res.send(embeds[0]);
        });

    });

    app.get('/embeds/:org', function (req, res) {
        mongo_data.embeds.find({org: req.params.org}, function (err, embeds) {
            if (err) res.status(500).send();
            else res.send(embeds);
        });
    });

    app.get('/fhirApps', (req, res) =>
        fhirApps.find(res, {}, apps =>
            res.send(apps))
    );
    app.get('/fhirApp/:id', (req, res) =>
        fhirApps.find(res, {_id: req.params.id}, apps =>
            res.send(apps[0]))
    );
    app.post('/fhirApp', [authorization.isSiteAdminMiddleware], (req, res) => {
        fhirApps.put(res, req.body, app =>
            res.send(app));
    });
    app.delete('/fhirApp/:id', [authorization.isSiteAdminMiddleware], (req, res) => {
        fhirApps.delete(res, req.params.id, () =>
            res.send());
    });


    app.post('/disableRule', function (req, res) {
        if (!authorizationShared.canOrgAuthority(req.user)) return res.status(403).send("Not Authorized");
        mongo_data.disableRule(req.body, function (err, org) {
            if (err) res.status(500).send(org);
            else res.send(org);
        });
    });

    app.post('/enableRule', function (req, res) {
        if (!authorizationShared.canOrgAuthority(req.user)) return res.status(403).send("Not Authorized");
        mongo_data.enableRule(req.body, function (err, org) {
            if (err) res.status(500).send(org);
            else res.send(org);
        });
    });

    app.get('/meshClassification', function (req, res) {
        if (!req.query.classification) return res.status(400).send("Missing Classification Parameter");
        mongo_data.findMeshClassification({flatClassification: req.query.classification}, function (err, mm) {
            if (err) return res.status(500).send();
            return res.send(mm[0]);
        });
    });

    app.get('/meshByEltId/:id', function (req, res) {
        if (!req.params.id) return res.status(400).send("Missing Id parameter");
        mongo_data.findMeshClassification({eltId: req.params.id}, function (err, mm) {
            if (err) return res.status(500).send();
            return res.send(mm.length ? mm[0] : '{}');
        });
    });


    app.get('/meshClassifications', function (req, res) {
        mongo_data.findMeshClassification({}, function (err, mm) {
            if (err) return res.status(500).send();
            return res.send(mm);
        });
    });

    let meshTopTreeMap = {
        'A': "Anatomy",
        'B': "Organisms",
        'C': "Diseases",
        'D': "Chemicals and Drugs",
        'E': "Analytical, Diagnostic and Therapeutic Techniques, and Equipment",
        'F': "Psychiatry and Psychology",
        'G': "Phenomena and Processes",
        'H': "Disciplines and Occupations",
        'I': "Anthropology, Education, Sociology, and Social Phenomena",
        'J': "Technology, Industry, and Agriculture",
        'K': "Humanities",
        'L': "Information Science",
        'M': "Named Groups",
        'N': "Health Care",
        'V': "Publication Characteristics",
        'Z': "Geographicals"
    };

    function flatTreesFromMeshDescriptorArray(descArr, cb) {
        let allTrees = new Set();
        async.each(descArr, function (desc, oneDescDone) {
            request(config.mesh.baseUrl + "/api/record/ui/" + desc, {json: true}, function (err, response, oneDescBody) {
                async.each(oneDescBody.TreeNumberList.TreeNumber, function (treeNumber, tnDone) {
                    request(config.mesh.baseUrl + "/api/tree/parents/" + treeNumber.t, {json: true}, function (err, response, oneTreeBody) {
                        let flatTree = meshTopTreeMap[treeNumber.t.substr(0, 1)];
                        if (oneTreeBody && oneTreeBody.length > 0) {
                            flatTree = flatTree + ";" + oneTreeBody.map(function (a) {
                                return a.RecordName;
                            }).join(";");
                        }
                        flatTree = flatTree + ";" + oneDescBody.DescriptorName.String.t;
                        allTrees.add(flatTree);
                        tnDone();
                    });
                }, function allTnDone() {
                    oneDescDone();
                });
            });
        }, function allDescDone() {
            cb(Array.from(allTrees));
        });
    }

    app.post('/meshClassification', function (req, res) {
        if (req.body._id) {
            let id = req.body._id;
            delete req.body._id;
            flatTreesFromMeshDescriptorArray(req.body.meshDescriptors, function (trees) {
                req.body.flatTrees = trees;
                mongo_data.MeshClassification.findOne({_id: id}, function (err, elt) {
                    elt.meshDescriptors = req.body.meshDescriptors;
                    elt.flatTrees = req.body.flatTrees;
                    elt.save(function (err, o) {
                        res.send(o);
                    });
                });
            });
        } else {
            flatTreesFromMeshDescriptorArray(req.body.meshDescriptors, function (trees) {
                req.body.flatTrees = trees;
                new mongo_data.MeshClassification(req.body).save(function (err, obj) {
                    if (err) res.status(500).send();
                    else {
                        res.send(obj);
                    }
                });
            });
        }
    });

    app.post("/syncWithMesh", function (req, res) {
        if (!config.autoSyncMesh && !authorizationShared.canOrgAuthority(req.user))
            return res.status(403).send("Not Authorized");
        elastic.syncWithMesh();
        res.send();
    });

    app.get('/syncWithMesh', function (req, res) {
        res.send(elastic.meshSyncStatus);
    });

    new CronJob('00 00 4 * * *', () => elastic.syncWithMesh(), null, true, 'America/New_York');

    app.get('/comments/eltId/:eltId', function (req, res) {
        let aggregate = [
            {$match: {'element.eltId': req.params.eltId}},
            {
                $lookup: {
                    from: 'users',
                    let: {'username': '$username'},
                    pipeline: [
                        {$match: {$expr: {$eq: ['$username', '$$username']}}},
                        {$project: {_id: 0, avatarUrl: 1}}
                    ],
                    as: '__user'
                }
            },
            {$replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ['$__user', 0]}, "$$ROOT"]}}},
            {$project: {__user: 0}}
        ];
        mongo_data.Comment.aggregate(aggregate, (err, comments) => {
            if (err) return res.status(500).send('Error retrieve comments');
            comments.forEach(c => {
                if (c.pendingApproval) c.text = "This comment is pending approval";
                c.replies.forEach(r => {
                    if (r.pendingApproval) r.text = "This reply is pending approval";
                });
            });
            res.send(comments);
        });
    });

    app.get('/comment/:commentId', (req, res) => {
        mongo_data.Comment.findById(req.params.commentId, dbLogger.handleError({req, res}, comment => res.send(comment)));
    });

    app.get('/commentsfor/:username/:from/:size', adminItemSvc.commentsForUser);

    app.get('/allComments/:from/:size', adminItemSvc.allComments);

    app.get('/orgComments/:from/:size', adminItemSvc.orgComments);

    app.post('/comments/approve', adminItemSvc.approveComment);

    app.post('/comments/decline', adminItemSvc.declineComment);

    app.post('/comment/status/resolve', [authorization.isAuthenticatedMiddleware], function (req, res) {
        adminItemSvc.updateCommentStatus(req, res, "resolved");
    });
    app.post('/comment/status/active', [authorization.isAuthenticatedMiddleware], function (req, res) {
        adminItemSvc.updateCommentStatus(req, res, "active");
    });

    app.post('/reply/status/resolve', [authorization.isAuthenticatedMiddleware], function (req, res) {
        adminItemSvc.updateReplyStatus(req, res, "resolved");
    });
    app.post('/reply/status/active', [authorization.isAuthenticatedMiddleware], function (req, res) {
        adminItemSvc.updateReplyStatus(req, res, "active");
    });

    /*    @TODO This endpoint will be improved in discuss module ticket */
    app.post('/comment/status/delete', [authorization.isAuthenticatedMiddleware], function (req, res) {
        mongo_data.Comment.findById(req.body.commentId, dbLogger.handleError({req, res}, comment => {
                if (!comment) return res.status(404).send("Comment not found");
                let type = comment.element.eltType;
                adminItemSvc.removeComment(req, res, comment, daoManager.getDao(type));
            })
        );

    });
    /*    @TODO This endpoint will be improved in discuss module ticket */
    app.post('/reply/status/delete', [authorization.isAuthenticatedMiddleware], function (req, res) {
        mongo_data.Comment.findOne({'replies._id': req.body.replyId}, dbLogger.handleError({req, res}, comment => {
                if (!comment) return res.status(404).send("Comment not found");
                let index = comment.replies.map(r => r._id.toString()).indexOf(req.body.replyId);
                if (index === -1) return res.status(404).send("Reply not found");
                comment.replies.splice(index, 1);
                let type = comment.element.eltType;
                adminItemSvc.removeReply(req, res, comment, daoManager.getDao(type));
            })
        );
    });

    app.post('/comments/reply', adminItemSvc.replyToComment);

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
                } else {
                    res.send();
                }
            });
        } else res.status(401).send();
    });

    app.get('/allDrafts', (req, res) => {
        if (req.user && req.user.siteAdmin) {
            mongo_cde.draftsList({}, (err, draftCdes) => {
                if (err) return res.status(500).send("Error Retrieving Draft CDEs");
                mongo_form.draftsList({}, (err, draftForms) => {
                    if (err) return res.status(500).send("Error Retrieving Draft Forms");
                    return res.send({draftCdes: draftCdes, draftForms: draftForms});
                });
            });
        } else {
            res.status(401).send();
        }
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
        } else {
            res.status(401).send();
        }
    });

    app.get('/myDrafts', (req, res) => {
        if (authorizationShared.isOrgCurator(req.user)) {
            mongo_cde.draftsList({"updatedBy.username": req.user.username}, (err, draftCdes) => {
                if (err) return res.status(500).send("Error Retrieving Draft CDEs");
                mongo_form.draftsList({"updatedBy.username": req.user.username}, (err, draftForms) => {
                    if (err) return res.status(500).send("Error Retrieving Draft Forms");
                    return res.send({draftCdes: draftCdes, draftForms: draftForms});
                });
            });
        } else {
            res.status(401).send();
        }
    });

    app.get('/viewedNotification', authorization.loggedInMiddleware, (req, res) => {
        mongo_data.updateUserLastViewNotification(req.user, err => {
            if (err) res.status(500).send("Error Updating User's Last View Notification Date.");
            else res.send();
        });
    });

    app.get('/notifications', authorization.loggedInMiddleware, (req, res) => {
        mongo_data.getNotifications(req.user, (err, result) => {
            if (err) return res.status(500).send("Error Retrieving Notifications.");
            else res.send(result);
        });
    });
    app.get('/unreadNotifications', authorization.loggedInMiddleware, (req, res) => {
        mongo_data.getUnreadNotifications(req.user, (err, result) => {
            if (err) return res.status(500).send("Error Retrieving Unread Notifications.");
            else res.send(result);
        });
    });

};
