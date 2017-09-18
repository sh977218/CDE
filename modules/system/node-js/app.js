let passport = require('passport')
    , mongo_data_system = require('./mongo-data')
    , config = require('./parseConfig')
    , dbLogger = require('./dbLogger.js')
    , logging = require('./logging.js')
    , orgsvc = require('./orgsvc')
    , usersrvc = require('./usersrvc')
    , express = require('express')
    , path = require('path')
    , classificationShared = require('../shared/classificationShared.js')
    , classificationNode = require('./classificationNode')
    , adminItemSvc = require("./adminItemSvc")
    , csrf = require('csurf')
    , authorizationShared = require("../../system/shared/authorizationShared")
    , daoManager = require('./moduleDaoManager')
    , fs = require('fs')
    , multer = require('multer')
    , exportShared = require('../../system/shared/exportShared')
    , tar = require('tar-fs')
    , zlib = require('zlib')
    , spawn = require('child_process').spawn
    , authorization = require('./authorization')
    , esInit = require('./elasticSearchInit')
    , elastic = require('./elastic.js')
    , app_status = require("./status.js")
    , async = require('async')
    , request = require('request')
    , CronJob = require('cron').CronJob
;

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

    app.use("/system/shared", express.static(path.join(__dirname, '../shared')));

    function checkHttps(req, res, next) {
        if (config.proxy) {
            if (req.protocol !== 'https') {
                if (req.query.gotohttps === "1") {
                    return res.send("Missing X-Forward-Proto Header");
                } else {
                    return res.redirect(config.publicUrl + "?gotohttps=1");
                }
            }
        }
        next();
    }

    ["/", "/cde/search", "/form/search", "/home", "/help/:title", "/createForm", "/createCde", "/boardList",
        "/board/:id", "/deview", "/myboards", "/sdcview", "/cde", "/form",
        "/cdeStatusReport", "/api", "/sdcview", "/triggerClientException",
        "/formView", "/quickBoard", "/searchPreferences", "/siteAudit", "/siteaccountmanagement", "/orgaccountmanagement",
        "/classificationmanagement", "/inbox", "/profile", "/login", "/orgAuthority", '/orgComments'].forEach(function (path) {
        app.get(path, checkHttps, function (req, res) {
            res.render('index', 'system', {config: config, loggedIn: req.user ? true : false, version: version});
        });
    });

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
                mongo_data_system.getClusterHostStatuses(function (err, statuses) {
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
        mongo_data_system.listOrgs(function (err, orgs) {
            if (err) return res.status(500).send("ERROR");
            res.send(orgs);
        });
    });

    app.get('/listOrgsDetailedInfo', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data_system.listOrgsDetailedInfo(function (err, orgs) {
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

    app.post('/login', csrf(), function (req, res, next) {
        let failedIp = findFailedIp(getRealIp(req));
        async.series([
                function checkCaptcha(captchaDone) {
                    if (failedIp && failedIp.nb > 2) {
                       if (req.body.recaptcha) {
                           request.post("https://www.google.com/recaptcha/api/siteverify",
                               {
                                   form: {
                                       secret: config.captchaCode,
                                       response: req.body.recaptcha,
                                       remoteip: getRealIp(req)
                                   },
                                   json: true
                               }, function (err, resp, body) {
                                   if (err) captchaDone(err);
                                   else if (!body.success) {
                                       captchaDone("incorrect recaptcha");
                                   } else {
                                       captchaDone();
                                   }
                               });
                       } else {
                           captchaDone("missing recaptcha");
                       }
                    } else {
                       captchaDone();
                    }
                }],
            function allDone(err) {
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
                            if (failedIp) failedIp.nb = 0;
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

    app.post('/logs', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin)
            return dbLogger.getLogs(req.body, function (err, result) {
                if (err) return res.send({error: err});
                res.send(result);
            });
        res.status(401).send();
    });

    app.post('/appLogs', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin)
            return dbLogger.appLogs(req.body, function (err, result) {
                if (err) return res.status(500).send("ERROR");
                return res.send(result);
            });
        res.status(401).send();
    });

    app.get('/logUsageDailyReport', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            dbLogger.usageByDay(function (result) {
                res.send(result);
            });
        } else {
            res.status(401).send();
        }
    });


    app.get('/org/:name', exportShared.nocacheMiddleware, function (req, res) {
        return mongo_data_system.orgByName(req.params.name, function (result) {
            res.send(result);
        });
    });

    app.get('/usernamesByIp/:ip', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            return mongo_data_system.usernamesByIp(req.params.ip, function (result) {
                res.send(result);
            });
        } else {
            res.status(401).send();
        }
    });


    app.get('/siteadmins', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            mongo_data_system.siteadmins(function (err, users) {
                res.send(users);
            });
        } else {
            res.status(401).send();
        }
    });

    app.get('/managedOrgs', function (req, res) {
        orgsvc.managedOrgs(req, res);
    });

    app.post('/addOrg', function (req, res) {
        if (authorizationShared.hasRole(req.user, "OrgAuthority")) {
            orgsvc.addOrg(req, res);
        } else {
            res.status(401).send();
        }
    });

    app.post('/updateOrg', function (req, res) {
        if (authorizationShared.hasRole(req.user, "OrgAuthority")) {
            mongo_data_system.updateOrg(req.body, res);
        } else {
            res.status(401).send();
        }
    });

    app.get('/user/:search', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.user) return res.send({});
        else if (!req.params.search) {
            return res.send({});
        } else if (req.params.search === 'me') {
            mongo_data_system.userById(req.user._id, function (err, user) {
                if (err) return res.status(500).send("ERROR");
                res.send(user);
            });
        } else {
            mongo_data_system.usersByName(req.params.search, function (err, users) {
                if (err) return res.status(500).send("ERROR");
                res.send(users);
            });
        }
    });

    app.post('/user/me', function (req, res) {
        if (!req.user) return res.status(401).send();
        if (req.user._id.toString() !== req.body._id)
            return res.status(401).send();
        mongo_data_system.userById(req.user._id, function (err, user) {
            user.email = req.body.email;
            user.publishedForms = req.body.publishedForms;
            user.save(function (err) {
                if (err) return res.status(500).send("ERROR");
                res.send("OK");
            });
        });
    });

    app.put('/user', function (req, res) {
        if (!authorizationShared.hasRole(req.user, "OrgAuthority"))
            return res.status(401).send("Not Authorized");
        mongo_data_system.addUser({
            username: req.body.username,
            password: "umls",
            quota: 1024 * 1024 * 1024
        }, function (err, newUser) {
            if (err) return res.status(500).end("ERROR");
            res.send(newUser.username + " added.");
        });
    });

    app.post('/addSiteAdmin', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            usersrvc.addSiteAdmin(req, res);
        } else {
            res.status(401).send();
        }
    });

    app.post('/removeSiteAdmin', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            usersrvc.removeSiteAdmin(req, res);
        } else {
            res.status(401).send();
        }
    });

    app.get('/myOrgsAdmins', exportShared.nocacheMiddleware, function (req, res) {
        usersrvc.myOrgsAdmins(req, res);
    });


    app.get('/orgAdmins', exportShared.nocacheMiddleware, function (req, res) {
        usersrvc.orgAdmins(req, res);
    });

    app.get('/orgCurators', exportShared.nocacheMiddleware, function (req, res) {
        usersrvc.orgCurators(req, res);
    });

    app.post('/addOrgAdmin', function (req, res) {
        if (authorization.isOrgAdmin(req, req.body.org)) {
            usersrvc.addOrgAdmin(req, res);
        } else {
            res.status(401).send();
        }
    });

    app.post('/removeOrgAdmin', function (req, res) {
        if (authorization.isOrgAdmin(req, req.body.orgName)) {
            usersrvc.removeOrgAdmin(req, res);
        } else {
            res.status(401).send();
        }
    });

    app.post('/addOrgCurator', function (req, res) {
        if (authorization.isOrgAdmin(req, req.body.org)) {
            usersrvc.addOrgCurator(req, res);
        } else {
            res.status(401).send();
        }
    });

    app.post('/removeOrgCurator', function (req, res) {
        if (authorization.isOrgAdmin(req, req.body.orgName)) {
            usersrvc.removeOrgCurator(req, res);
        } else {
            res.status(401).send();
        }
    });

    app.get('/searchUsers/:username?', function (req, res) {
        if (!authorization.isSiteOrgAdmin(req))
            return res.status(401).send("Not Authorized");
        mongo_data_system.usersByPartialName(req.params.username, function (err, users) {
            res.send({users: users});
        });
    });

    app.post('/updateUserRoles', function (req, res) {
        if (!authorizationShared.hasRole(req.user, "OrgAuthority"))
            return res.status(401).send("Not Authorized");
        usersrvc.updateUserRoles(req.body, function (err) {
            if (err) res.status(500).end();
            else res.status(200).end();
        });
    });

    app.get('/user/avatar/:username', function (req, res) {
        mongo_data_system.userByName(req.params.username, function (err, u) {
            res.send(u && u.avatarUrl ? u.avatarUrl : "");
        });
    });

    app.post('/updateUserAvatar', function (req, res) {
        if (!authorizationShared.hasRole(req.user, "OrgAuthority"))
            return res.status(401).send("Not Authorized");
        usersrvc.updateUserAvatar(req.body, function (err) {
            if (err) res.status(500).end();
            else res.status(200).end();
        });
    });

    app.post('/updateTesterStatus', function (req, res) {
        if (!authorizationShared.hasRole(req.user, "OrgAuthority"))
            return res.status(401).send("Not Authorized");
        mongo_data_system.User.findOne({_id: req.body._id}, function (err, u) {
            u.tester = req.body.tester;
            u.save(() => res.send());
        });
    });

    app.get('/siteaccountmanagement', exportShared.nocacheMiddleware, function (req, res) {
        if (req.user && req.user.siteAdmin) {
            res.render('siteaccountmanagement', "system");
        } else {
            res.status(401).send();
        }
    });

    app.get('/orgaccountmanagement', exportShared.nocacheMiddleware, function (req, res) {
        res.render('orgAccountManagement', "system");
    });

    app.get('/data/:imgtag', function (req, res) {
        mongo_data_system.getFile(req.user, req.params.imgtag, res);
    });

    app.get('/data/status/:imgtag', function (req, res) {
        mongo_data_system.getFileStatus(req.params.imgtag, function (err, status) {
            if (err) res.status(404).send();
            res.send(status);
        });
    });

    app.delete('/classification/org', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.query.orgName)) {
            return res.status(403).end();
        } else {
            classificationNode.modifyOrgClassification(req.query, classificationShared.actions.delete, function (err, org) {
                res.send(org);
            });
        }
    });

    app.post('/classification/org', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) {
            res.status(403).end();
            return;
        }
        classificationNode.addOrgClassification(req.body, function (err, org) {
            res.send(org);
        });
    });

    app.post('/classification/rename', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName))
            return res.status(401).send();
        classificationNode.modifyOrgClassification(req.body, classificationShared.actions.rename, function (err, org) {
            if (!err) res.send(org);
            else res.status(202).send({error: {message: "Classification does not exists."}});
        });
    });

    app.post('/classifyEntireSearch', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.newClassification.orgName))
            return res.status(401).send();
        classificationNode.classifyEntireSearch(req, function (err) {
            if (!err) res.end();
            else res.status(202).send({error: {message: err}});
        });
    });

    app.post('/transferSteward', function (req, res) {
        orgsvc.transferSteward(req, res);
    });

    // TODO this works only for CDEs. Forms TODO later.
    app.post('/classification/bulk/tinyId', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) return res.status(403).send("Not Authorized");
        if (!req.body.orgName || !req.body.categories) return res.status(400).send("Bad Request");
        let elements = req.body.elements;
        if (elements.length <= 50)
            adminItemSvc.bulkClassifyCdes(req.user, req.body.eltId, elements, req.body, function (err) {
                if (err) res.status(500).send("ERROR");
                else res.send("Done");
            });
        else {
            res.send("Processing");
            adminItemSvc.bulkClassifyCdes(req.user, req.body.eltId, elements, req.body);
        }
        mongo_data_system.addToClassifAudit({
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

    app.get('/getAllUsernames', function (req, res) {
        if (authorization.isSiteOrgAdmin(req)) {
            usersrvc.getAllUsernames(req, res);
        } else {
            res.status(401).send();
        }
    });

    app.post('/getServerErrors', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            dbLogger.getServerErrors(req.body, function (err, result) {
                res.send(result);
            });
        } else {
            res.status(401).send();
        }
    });

    app.post('/getClientErrors', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            dbLogger.getClientErrors(req.body, function (err, result) {
                res.send(result);
            });
        } else {
            res.status(401).send();
        }
    });


    app.post('/getFeedbackIssues', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            dbLogger.getFeedbackIssues(req.body, function (err, result) {
                res.send(result);
            });
        } else {
            res.status(401).send();
        }
    });

    app.post('/logClientException', function (req, res) {
        dbLogger.logClientError(req, function (err, result) {
            res.send(result);
        });
    });

    app.get('/triggerServerErrorExpress', function (req, res) {
        res.send("received");
        trigger.error(); // jshint ignore:line
    });

    app.get('/triggerServerErrorMongoose', function (req, res) {
        mongo_data_system.orgByName("none", function () {
            res.send("received");
            trigger.error(); // jshint ignore:line
        });
    });

    app.post('/mail/messages/new', function (req, res) {
        if (req.isAuthenticated()) {
            let message = req.body;
            if (message.author.authorType === "user") {
                message.author.name = req.user.username;
            }
            message.date = new Date();
            mongo_data_system.createMessage(message, function () {
                res.send();
            });
        } else {
            res.status(401).send();
        }
    });

    app.post('/mail/messages/update', function (req, res) {
        if (req.isAuthenticated()) {
            mongo_data_system.updateMessage(req.body, function (err) {
                if (err) {
                    res.statusCode = 404;
                    res.send("Error while updating the message");
                } else {
                    res.send();
                }
            });
        } else {
            res.status(401).send();
        }
    });

    app.post('/mail/messages/:type', function (req, res) {
        if (req.isAuthenticated()) {
            mongo_data_system.getMessages(req, function (err, messages) {
                if (err) res.status(404).send(err);
                else res.send(messages);
            });
        } else {
            res.status(401).send("Not Authorized");
        }
    });

    app.post('/addUserRole', function (req, res) {
        if (authorizationShared.hasRole(req.user, "CommentReviewer")) {
            mongo_data_system.addUserRole(req.body, function (err) {
                if (err) res.status(404).send(err);
                else res.send("Role added.");
            });
        }
    });

    app.get('/mailStatus', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.user) return res.send({count: 0});
        mongo_data_system.mailStatus(req.user, function (err, result) {
            res.send({count: result});
        });
    });

    // @TODO this should be POST
    app.get('/attachment/approve/:id', function (req, res) {
        if (!authorizationShared.hasRole(req.user, "AttachmentReviewer")) return res.status(401).send();
        mongo_data_system.alterAttachmentStatus(req.params.id, "approved", function (err) {
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
        mongo_data_system.deleteFileById(req.params.id);
        res.send("Attachment declined");
    });

    app.post('/getClassificationAuditLog', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            mongo_data_system.getClassificationAuditLog(req.body, function (err, result) {
                if (err) return res.status(500).send();
                res.send(result);
            });
        } else {
            res.status(401).send("Not Authorized");
        }
    });

    app.post('/user/update/searchSettings', function (req, res) {
        usersrvc.updateSearchSettings(req.user.username, req.body, function (err) {
            if (err) res.status(500).send("ERROR");
            else res.send("Search settings updated.");
        });
    });

    app.post('/embed/', function (req, res) {
        if (authorization.isOrgAdmin(req, req.body.org)) {
            mongo_data_system.embeds.save(req.body, function (err, embed) {
                if (err) res.status(500).send("There was an error saving this embed.");
                else res.send(embed);
            });
        } else {
            res.status(401).send();
        }
    });

    app.delete('/embed/:id', function (req, res) {
        mongo_data_system.embeds.find({_id: req.params.id}, function (err, embeds) {
            if (err) return res.status(500).send();
            if (embeds.length !== 1) return res.status.send("Expectation not met: one document.");
            let embed = embeds[0];
            if (authorization.isOrgAdmin(req, embed.org)) {
                mongo_data_system.embeds.delete(req.params.id, function (err) {
                    if (err) res.status(500).send("There was an error removing this embed.");
                    else res.send();
                });
            } else {
                res.status(401).send();
            }
        });
    });


    app.get('/embed/:id', function (req, res) {
        mongo_data_system.embeds.find({_id: req.params.id}, function (err, embeds) {
            if (err) return res.status(500).send();
            if (embeds.length !== 1) return res.status.send("Expectation not met: one document.");
            else res.send(embeds[0]);
        });

    });

    app.get('/embeds/:org', function (req, res) {
        mongo_data_system.embeds.find({org: req.params.org}, function (err, embeds) {
            if (err) res.status(500).send();
            else res.send(embeds);
        });
    });

    app.post('/feedback/report', function (req, res) {
        dbLogger.saveFeedback(req, function () {
            res.send({});
        });
    });

    app.post('/api/reloadProd', authorization.checkSiteAdmin, function (req, res) {
        if (!config.prodDump.enabled) return res.status(401).send();
        let target = './prodDump';
        let untar = tar.extract(target);
        let rmTargets = [target + '/system*', target + '/clusterstatuses*'];
        if (!req.body.includeAll) {
            rmTargets.push(target + '/cdeAudit*');
            rmTargets.push(target + '/classificationAudit*');
            rmTargets.push(target + '/fs.*');
            rmTargets.push(target + '/sessions.*');
        }
        request(req.body.url, {rejectUnauthorized: false}).pipe(zlib.createGunzip()).pipe(untar);
        untar.on('finish', function () {
            spawn('rm', rmTargets).on('exit', function () {
                let restore = spawn('mongorestore',
                    ['-host', config.database.servers[0].host,
                        '-u', config.database.appData.username,
                        '-p', config.database.appData.password,
                        './prodDump',
                        '--drop',
                        '--db', config.database.appData.db
                    ], {stdio: 'inherit'});
                restore.on('exit', function () {
                    let rm = spawn('rm', [target + '/*']);
                    rm.on('exit', function () {
                        esInit.indices.forEach(elastic.reIndex);
                        res.send();
                    });
                });
            });

        });
    });

    let loincUploadStatus;
    app.post('/uploadLoincCsv', multer(), function (req, res) {
        loincUploadStatus = [];
        let load = spawn(config.pmNodeProcess, ['./ingester/loinc/loadLoincFields.js', req.files.uploadedFiles.path]).on('exit', function (code) {
            loincUploadStatus.push("Complete with Code: " + code);
            setTimeout(function () {
                loincUploadStatus = [];
            }, 5 * 60 * 1000);
            fs.unlink(req.files.uploadedFiles.path);
        });
        res.send();

        load.stdout.on('data', function (data) {
            loincUploadStatus.push("" + data);
        });
        load.stderr.on('data', function (data) {
            loincUploadStatus.push("" + data);
        });
    });

    app.get('/uploadLoincCsvStatus', function (req, res) {
        res.send(loincUploadStatus);
    });

    app.post('/disableRule', function (req, res) {
        if (!authorizationShared.hasRole(req.user, "OrgAuthority")) return res.status(403).send("Not Authorized");
        mongo_data_system.disableRule(req.body, function (err, org) {
            if (err) res.status(500).send(org);
            else res.send(org);
        });
    });

    app.post('/enableRule', function (req, res) {
        if (!authorizationShared.hasRole(req.user, "OrgAuthority")) return res.status(403).send("Not Authorized");
        mongo_data_system.enableRule(req.body, function (err, org) {
            if (err) res.status(500).send(org);
            else res.send(org);
        });
    });

    app.get('/meshClassification', function (req, res) {
        if (!req.query.classification) return res.status(400).send("Missing Classification Parameter");
        mongo_data_system.findMeshClassification({flatClassification: req.query.classification}, function (err, mm) {
            if (err) return res.status(500).send();
            return res.send(mm[0]);
        });
    });

    app.get('/meshByEltId/:id', function (req, res) {
        if (!req.params.id) return res.status(400).send("Missing Id parameter");
        mongo_data_system.findMeshClassification({eltId: req.params.id}, function (err, mm) {
            if (err) return res.status(500).send();
            return res.send(mm[0]);
        });
    });


    app.get('/meshClassifications', function (req, res) {
        mongo_data_system.findMeshClassification({}, function (err, mm) {
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
                mongo_data_system.MeshClassification.findOne({_id: id}, function (err, elt) {
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
                new mongo_data_system.MeshClassification(req.body).save(function (err, obj) {
                    if (err) res.status(500).send();
                    else {
                        res.send(obj);
                    }
                });
            });
        }
    });

    app.post("/syncWithMesh", function (req, res) {
        if (!config.autoSyncMesh && !authorizationShared.hasRole(req.user, "OrgAuthority"))
            return res.status(403).send("Not Authorized");
        elastic.syncWithMesh();
        res.send();
    });

    app.get('/syncWithMesh', function (req, res) {
        res.send(elastic.meshSyncStatus);
    });

    new CronJob({
        cronTime: '00 00 4 * * *',
        //noinspection JSUnresolvedFunction
        onTick: function () {
            elastic.syncWithMesh();
        },
        start: false,
        timeZone: "America/New_York"
    }).start();

    app.get('/comments/eltId/:eltId', function (req, res) {
        mongo_data_system.Comment.find({"element.eltId": req.params.eltId}).sort({created: 1}).exec(function (err, comments) {
            let result = comments.filter(c => c.status !== 'deleted');
            result.forEach(function (c) {
                c.replies = c.replies.filter(r => r.status !== 'deleted');
            });
            result.forEach(function (c) {
                if (c.pendingApproval) c.text = "This comment is pending approval";
                c.replies.forEach(function (r) {
                    if (r.pendingApproval) r.text = "This comment is pending approval";
                });
            });
            res.send(result);
        });
    });

    app.get('/comment/:commentId', function (req, res) {
        mongo_data_system.Comment.findOne({_id: req.params.commentId}).exec(function (err, comment) {
            if (err) res.send(500);
            else
                res.send(comment);
        });
    });

    app.get('/commentsfor/:username/:from/:size', adminItemSvc.commentsForUser);

    app.get('/allComments/:from/:size', adminItemSvc.allComments);

    app.get('/orgComments/:from/:size', adminItemSvc.orgComments);

    app.post('/comments/approve', adminItemSvc.approveComment);

    app.post('/comments/decline', adminItemSvc.declineComment);

    app.post('/comments/status/resolved', function (req, res) {
        adminItemSvc.updateCommentStatus(req, res, "resolved");
    });
    app.post('/comments/status/active', function (req, res) {
        adminItemSvc.updateCommentStatus(req, res, "active");
    });
    app.post('/comments/reply', adminItemSvc.replyToComment);

};
