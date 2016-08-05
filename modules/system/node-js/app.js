var passport = require('passport')
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
    , auth = require('./authorization')
    , csrf = require('csurf')
    , authorizationShared = require("../../system/shared/authorizationShared")
    , daoManager = require('./moduleDaoManager')
    , request = require('request')
    , fs = require('fs')
    , multer = require('multer')
    , exportShared = require('../../system/shared/exportShared')
    , tar = require('tar-fs')
    , zlib = require('zlib')
    , spawn = require('child_process').spawn
    , authorization = require('../../system/node-js/authorization')
    , esInit = require('./elasticSearchInit')
    , elastic = require('./elastic.js')
    , app_status = require("./status.js")
    , async = require('async')
    ;

exports.init = function (app) {

    var getRealIp = function (req) {
        if (req._remoteAddress) return req._remoteAddress;
        if (req.ip) return req.ip;
    };

    var version = "local-dev";
    try {
        version = require('./version.js').version;
    } catch (e) {
    }

    app.use("/system/shared", express.static(path.join(__dirname, '../shared')));

    ["/cde/search", "/form/search", "/home", "/stats", "/help/:title", "/createForm", "/createCde", "/boardList",
        "/board/:id", "/deview", "/myboards", "/sdcview",
        "/cdeStatusReport", "/board/:id", "/deview", "/myboards", "/sdcview",
        "/formView", "/quickBoard", "/searchSettings", "/siteAudit", "/siteaccountmanagement", "/orgaccountmanagement",
        "/classificationmanagement", "/inbox", "/profile", "/login", "/orgauthority"].forEach(function (path) {
        app.get(path, function (req, res) {
            res.render('index', 'system', {config: config, loggedIn: req.user ? true : false, version: version});
        });
    });

    var token = mongo_data_system.generateTinyId();
    setInterval(function () {
        token = mongo_data_system.generateTinyId();
    }, (config.pm.tokenInterval || 5) * 60 * 1000);

    app.post('/deploy', multer(), function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            if (!token) {
                return res.status(500).send("No valid token");
            }
            request.post({
                url: 'http://' + req.body.hostname + ':' + req.body.pmPort + '/' + "deploy",
                formData: {
                    token: token
                    , "requester_host": config.hostname
                    , "requester_port": config.port
                    , deployFile: fs.createReadStream(req.files.deployFile.path)
                }
            }).on('response', function (response) {
                res.status(response.statusCode).send();
                fs.unlink(req.files.deployFile.path);
            });
        } else {
            res.status(401).send();
        }
    });

    app.get('/statusToken', function (req, res) {
        res.send(token);
    });

    app.post('/reindex/:indexPosition', function (req, res) {
        if (app.isLocalIp(getRealIp(req)) && req.isAuthenticated() && req.user.siteAdmin) {
            var index = esInit.indices[req.params.indexPosition];
            var indexName = index.indexName;
            var indexMapping = index.indexJson;
            var dao = elastic.daos[index.name];
            var riverFunction = index.filter;
            elastic.injectDataToIndex(indexName, indexMapping, dao, riverFunction);
        } else {
            res.status(401).send();
        }
    });

    app.get('/serverStatuses', function (req, res) {
        if (app.isLocalIp(getRealIp(req))) {
            app_status.getStatus(function() {
                mongo_data_system.getClusterHostStatuses(function (err, statuses) {
                    res.send({esIndices: esInit.indices, statuses: statuses});
                });
            });
        } else {
            res.status(401).send();
        }
    });

    app.post('/serverState', function (req, res) {
        if (app.isLocalIp(getRealIp(req)) && req.isAuthenticated() && req.user.siteAdmin) {
            req.body.nodeStatus = "Stopped";
            mongo_data_system.updateClusterHostStatus(req.body, function (err) {
                if (err) {
                    res.status(500).send("Unable to update cluster status");
                }
                request.post('http://' + req.body.hostname + ':' + req.body.pmPort + '/' + req.body.action,
                    {
                        json: true,
                        body: {
                            token: token,
                            port: req.body.port,
                            requester: {
                                host: config.hostname, port: config.port
                            }
                        }
                    },
                    function (err, response) {
                        if (err) {
                            console.log("err: " + err);
                            logging.errorLogger.error(JSON.stringify({msg: 'Unable to ' + req.body.action + ' server'}));
                            return res.status(500).send('Unable.');
                        }
                        if (response.statusCode !== 200) {
                            return res.status(500).send('Unable ' + response.statusCode);
                        }
                        return res.send('OK');
                    });
            });
        } else {
            res.status(401).send();
        }
    });

    app.get("/supportedBrowsers", function (req, res) {
        res.render('supportedBrowsers', 'system');
    });

    app.get('/', function (req, res) {
        res.render('index', 'system', {config: config, loggedIn: req.user ? true : false, version: version});
    });

    app.get('/gonowhere', function (req, res) {
        res.send("<html><body>Nothing here</body></html>");
    });

    app.get('/listOrgs', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data_system.listOrgs(function (err, orgs) {
            if (err) {
                res.send("ERROR");
            } else {
                res.send(orgs);
            }
        });
    });

    app.get('/listOrgsDetailedInfo', exportShared.nocacheMiddleware, function (req, res) {
        mongo_data_system.listOrgsDetailedInfo(function (err, orgs) {
            if (err) {
                logging.errorLogger.error(JSON.stringify({msg: 'Failed to get list of orgs detailed info.'}));
                res.status(403).send('Failed to get list of orgs detailed info.');
            } else {
                res.send(orgs);
            }
        });
    });

    app.get('/loginText', csrf(), function (req, res) {
        var token = req.csrfToken();
        res.render("loginText", "system", {csrftoken: token});
    });

    var failedIps = [];

    app.get('/csrf', csrf(), function (req, res) {
        exportShared.nocacheMiddleware(req, res);
        var resp = {csrf: req.csrfToken()};
        var failedIp = findFailedIp(getRealIp(req));
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
        var failedIp = findFailedIp(getRealIp(req));
        var err;
        if (failedIp && failedIp.nb > 2) {
            if (req.body.recaptcha) {
                request.post("https://www.google.com/recaptcha/api/siteverify",
                    {
                        form: {
                            secret: config.captchaCode,
                            response: req.body['g-recaptcha-response'],
                            remoteip: getRealIp(req)
                        }
                    }, function (err, resp, body) {
                        if (!body.success) {
                            err = "incorrect recaptcha";
                        }
                    });
            } else {
                err = "missing reCaptcha";
            }
        }

        if (err) {
            return res.status(412).send(err);
        }

        // Regenerate is used so appscan won't complain
        req.session.regenerate(function () {
            passport.authenticate('local', function (err, user) {
                if (err) {
                    return res.status(403).end();
                }
                if (!user) {
                    if (failedIp && config.useCaptcha) failedIp.nb++;
                    else {
                        failedIps.unshift({ip: getRealIp(req), nb: 1});
                        failedIps.length = 50; // simon doesn't like because what if more than 50 people do this
                    }
                    return res.status(403).send();
                }
                req.logIn(user, function (err) {
                    if (failedIp) {
                        failedIp.nb = 0;
                    }
                    if (err) {
                        return res.status(403).end();
                    }
                    req.session.passport = {user: req.user._id};
                    return res.send("OK");
                });
            })(req, res, next);
        });
    });

    app.post('/logout', function (req, res) {
        if (!req.session) {
            return res.status(403).end();
        }
        req.session.destroy(function () {
            req.logout();
            res.clearCookie('connect.sid');
            res.redirect('/#/login');
        });
    });

    app.get('/nlmoauth/callback',
        passport.authenticate('oauth2', {failureRedirect: '/login'}),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });

    app.get('/nlmoauth',
        passport.authenticate('oauth2', {scope: 'personaldata'}));

    app.post('/logs', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            dbLogger.getLogs(req.body.query, function (err, result) {
                if (err) {
                    res.send({error: err});
                } else {
                    res.send(result);
                }
            });
        } else {
            res.status(401).send();
        }
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
        if (app.isLocalIp(getRealIp(req))) {
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
            orgsvc.updateOrg(req, res);
        } else {
            res.status(401).send();
        }
    });

    app.get('/user/me', exportShared.nocacheMiddleware, function (req, res) {
        if (!req.user) {
            res.send("Not logged in.");
        } else {
            mongo_data_system.userById(req.user._id, function (err, user) {
                res.send(user);
            });
        }
    });

    app.post('/user/me', function (req, res) {
        if (!req.user) {
            res.status(401).send();
        } else {
            if (req.user._id.toString() !== req.body._id) {
                res.status(401).send();
            } else {
                mongo_data_system.userById(req.user._id, function (err, user) {
                    user.email = req.body.email;
                    user.save(function (err) {
                        if (err) res.status(500).send("Unable to save");
                        res.send("OK");
                    });
                });
            }
        }
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

    app.isLocalIp = function (ip) {
        return ip.indexOf("127.0") !== -1 || ip === "::1" || ip.indexOf(config.internalIP) === 0 || ip.indexOf("ffff:" + config.internalIP) > -1;
    };

    app.get('/searchUsers/:username?', function (req, res) {
        if (app.isLocalIp(getRealIp(req)) && req.user && req.user.siteAdmin) {
            mongo_data_system.usersByPartialName(req.params.username, function (err, users) {
                res.send({users: users});
            });
        } else {
            res.status(401).send();
        }
    });

    app.post('/updateUserRoles', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            usersrvc.updateUserRoles(req.body, function (err) {
                if (err) res.status(500).end();
                else res.status(200).end();
            });
        } else {
            res.status(401).send();
        }
    });


    app.get('/siteaccountmanagement', exportShared.nocacheMiddleware, function (req, res) {
        if (app.isLocalIp(getRealIp(req)) && req.user && req.user.siteAdmin) {
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

    app.post('/classification/elt', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) {
            res.status(401).send();
            return;
        }
        classificationNode.cdeClassification(req.body, classificationShared.actions.create, function (err) {
            if (!err) {
                res.send({code: 200, msg: "Classification Added"});
                mongo_data_system.addToClassifAudit({
                    date: new Date()
                    , user: {
                        username: req.user.username
                    }
                    , elements: [{
                        _id: req.body.cdeId
                    }]
                    , action: "add"
                    , path: [req.body.orgName].concat(req.body.categories)
                });
            } else {
                res.send({code: 403, msg: "Classification Already Exists"});
            }

        });
    });

    app.delete('/classification/elt', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.query.orgName)) {
            res.status(401).send();
            return;
        }
        classificationNode.cdeClassification(req.query, classificationShared.actions.delete, function (err) {
            if (!err) {
                res.end();
                mongo_data_system.addToClassifAudit({
                    date: new Date()
                    , user: {
                        username: req.user.username
                    }
                    , elements: [{
                        _id: req.query.cdeId
                    }]
                    , action: "delete"
                    , path: [req.query.orgName].concat(req.query.categories)
                });
            } else {
                res.status(202).send({error: {message: "Classification does not exists."}});
            }
        });
    });

    app.delete('/classification/org', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.query.orgName)) {
            res.status(403).end();
            return;
        }
        classificationNode.modifyOrgClassification(req.query, classificationShared.actions.delete, function (err, org) {
            res.send(org);
        });
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
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) {
            res.status(401).send();
            return;
        }
        classificationNode.modifyOrgClassification(req.body, classificationShared.actions.rename, function (err, org) {
            if (!err) {
                res.send(org);
            }
            else res.status(202).send({error: {message: "Classification does not exists."}});
        });
    });

    app.post('/classifyEntireSearch', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.newClassification.orgName)) {
            res.status(401).send();
            return;
        }
        classificationNode.classifyEntireSearch(req, function (err) {
            if (!err) res.end();
            else res.status(202).send({error: {message: err}});
        });
    });

    app.post('/transferSteward', function (req, res) {
        orgsvc.transferSteward(req, res);
    });

    app.post('/classification/bulk/tinyid', function (req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.classification.orgName)) {
            res.status(403).send("Not Authorized");
            return;
        }
        var action = function (elt, actionCallback) {
            var classifReq = {
                orgName: req.body.classification.orgName
                , categories: req.body.classification.categories
                , tinyId: elt.id || elt
                , version: elt.version || null
            };
            classificationNode.cdeClassification(classifReq, classificationShared.actions.create, actionCallback);
        };
        adminItemSvc.bulkAction(req.body.elements, action, function () {
            var elts = req.body.elements.map(function (e) {
                return e.id;
            });
            adminItemSvc.bulkAction(elts, action, function (err) {
                if (!err) {
                    res.send();
                    mongo_data_system.addToClassifAudit({
                        date: new Date()
                        , user: {
                            username: req.user.username
                        }
                        , elements: req.body.elements.map(function (e) {
                            return {tinyId: e.id};
                        })
                        , action: "add"
                        , path: [req.body.classification.orgName].concat(req.body.classification.categories)
                    });
                }
                else res.status(202).send({error: {message: err}});
            });
        });
    });

    app.get('/getAllUsernames', function (req, res) {
        if (auth.isSiteOrgAdmin(req)) {
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
            var message = req.body;
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
        mongo_data_system.getMessages(req, function (err, messages) {
            if (err) res.status(404).send(err);
            else res.send(messages);
        });
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
        if (!req.user) return res.status(401).send();
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
            dao.removeAttachmentLinks(req.params.id);
        });
        mongo_data_system.deleteFileById(req.params.id);
        res.send("Attachment declined");
    });

    app.post('/getClassificationAuditLog', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            mongo_data_system.getClassificationAuditLog(req.body, function (err, result) {
                res.send(result);
            });
        } else {
            res.status(401).send("Not Authorized");
        }
    });

    app.post('/user/update/searchSettings', function (req, res) {
        usersrvc.updateSearchSettings(req.user.username, req.body, function (err) {
            if (err) res.status(500).send(err);
            else res.send("Search settings updated.");
        });
    });

    app.post('/embed/', function (req, res) {
        if (authorization.isOrgAdmin(req, req.body.org)) {
            mongo_data_system.embeds.save(req.body, function(err, embed) {
                if (err) res.status(500).send("There was an error saving this embed.");
                else res.send(embed);
            });
        } else {
            res.status(401).send();
        }
    });

    app.delete('/embed/:id', function (req, res) {
        mongo_data_system.embeds.find({_id: req.params.id}, function(err, embeds) {
            if (err) return res.status(500).send();
            if (embeds.length !== 1) return res.status.send("Expectation not met: one document.");
            var embed = embeds[0];
            if (authorization.isOrgAdmin(req, embed.org)) {
                mongo_data_system.embeds.delete(req.params.id, function(err) {
                    if (err) res.status(500).send("There was an error removing this embed.");
                    else res.send();
                });
            } else {
                res.status(401).send();
            }
        });
    });


    app.get('/embed/:id', function (req, res) {
        mongo_data_system.embeds.find({_id: req.params.id}, function(err, embeds) {
            if (err) return res.status(500).send();
            if (embeds.length !== 1) return res.status.send("Expectation not met: one document.");
            else res.send(embeds[0]);
        });

    });

    app.get('/embeds/:org', function(req, res) {
        mongo_data_system.embeds.find({org: req.params.org}, function(err, embeds) {
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
        var target = './prodDump';
        var untar = tar.extract(target);
        request(req.body.url, {rejectUnauthorized: false}).pipe(zlib.createGunzip()).pipe(untar);
        untar.on('finish', function () {
            spawn('rm', [target + '/system*']).on('exit', function () {
                var restore = spawn('mongorestore', ['-host', config.database.servers[0].host, '-u', config.database.appData.username, '-p', config.database.appData.password, './prodDump', '--drop', '--db', config.database.appData.db], {stdio: 'inherit'});
                restore.on('exit', function () {
                    var rm = spawn('rm', [target + '/*']);
                    rm.on('exit', function () {
                        esInit.indices.forEach(elastic.reIndex);
                        res.send();
                    });
                });
            });

        });
    });

    var loincUploadStatus;
    app.post('/uploadLoincCsv', multer(), function (req, res) {
        loincUploadStatus = [];
        var load = spawn(config.pmNodeProcess, ['./ingester/loinc/loadLoincFields.js', req.files.uploadedFiles.path]).on('exit', function (code) {
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

    app.post('/disableRule', function(req, res){
        if (!authorizationShared.hasRole(req.user, "OrgAuthority")) return res.status(403).send("Please login");
        mongo_data_system.disableRule(req.body, function(err, org){
            if (err) res.status(500).send(org);
            else res.send(org);
        });
    });

    app.post('/enableRule', function(req, res){
        if (!authorizationShared.hasRole(req.user, "OrgAuthority")) return res.status(403).send("Please login");
        mongo_data_system.enableRule(req.body, function(err, org){
            if (err) res.status(500).send(org);
            else res.send(org);
        });
    });
};
