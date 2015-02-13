var passport = require('passport')
  , mongo_data_system = require('./mongo-data')
  , config = require('config')
  , dbLogger = require('./dbLogger.js')
  , logging = require('./logging.js')
  , orgsvc = require('./orgsvc')
  , usersrvc = require('./usersrvc')
  , express = require('express')
  , path = require('path')
  , classificationShared = require('../shared/classificationShared.js')
  , classificationNode = require('./classificationNode')
  , adminItemSvc = require("./adminItemSvc")       
  , auth = require( './authorization' )
  , csrf = require('csurf')
;

exports.nocacheMiddleware = function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    if (next) {
        next();
    }
};

exports.init = function(app) {
    app.use("/system/shared", express.static(path.join(__dirname, '../shared')));
    
    var viewConfig = {modules: config.modules};

    app.get('/template/:module/:template', function(req, res) {        
        res.render(req.params.template, req.params.module, {config: viewConfig});
    });		

    app.get("/supportedBrowsers", function(req, res) {
       res.render('supportedBrowsers', 'system'); 
    });
    
    app.get('/', function(req, res) {
        res.render('index', 'system', {config: viewConfig});
    });

    app.get('/home', function(req, res) {
        res.render('home', 'system');
    });    

    app.get('/gonowhere', function(req, res) {
        res.send("<html><body>Nothing here</body></html>");
    });

    app.get('/listOrgs', function(req, res) {
        mongo_data_system.listOrgs(function(err, orgs) { 
            if (err) {
                res.send("ERROR");
            } else {
                res.send(orgs);
            }   
        });        
    });

    app.get('/listOrgsDetailedInfo', function(req, res) {
        mongo_data_system.listOrgsDetailedInfo(function(err, orgs) {
            if (err) {
                logging.expressErrorLogger.error(JSON.stringify({msg: 'Failed to get list of orgs detailed info.'}));
                res.status(403).send('Failed to get list of orgs detailed info.');
            } else {
                res.send(orgs);
            }   
        });
    });

    app.get('/loginText', csrf(), function(req, res, next) {
        var token = req.csrfToken();
        res.render("loginText", "system", {csrftoken: token});
    });

    app.get('/csrf', csrf(), function(req, res) {
        res.send(req.csrfToken());
    });

    app.post('/login', csrf(), function(req, res, next) {
        // Regenerate is used so appscan won't complain
        req.session.regenerate(function(err) {  
            passport.authenticate('local', function(err, user, info) {
                if (err) { return res.status(403).end(); }
                if (!user) { 
                    return res.status(403).send(info.message);
                }
                req.logIn(user, function(err) {
                    if (err) { return res.status(403).end(); }
                    req.session.passport = {user: req.user._id};
                    return res.send("OK");
                });
            })(req, res, next);
        });
    });
    
    app.get('/login', exports.nocacheMiddleware, function(req, res) {
        res.render('login', "system");
    });

    app.get('/logout', function(req, res) {
        if (!req.session) {
            return res.status(403).end();
        } 
        req.session.destroy(function (err) {
            req.logout();
            res.clearCookie('connect.sid');
            res.redirect('/#/login');
        });
        
    });

    app.post('/logs', function (req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            dbLogger.getLogs(req.body.query, function(err, result) {
                if (err) {
                    res.send({error: err});
                } else {
                    res.send(result);
                }
            });
        } else {
            res.status(403).send("You are not authorized.");                    
        }
    });
    
    app.get('/logUsageDailyReport', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            dbLogger.usageByDay(function (result) {
                res.send(result);
            });
        } else {
            res.status(403).send("You are not authorized.");                    
        }        
    });


    app.get('/org/:name', function(req, res) {
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
            res.status(403).send("You are not authorized.");                    
        }         
    });

    app.get('/siteadmins', function(req, res) {
        var ip = req.remoteAddress || req.ip;
        if (ip.indexOf("127.0") === 0 || ip.indexOf(config.internalIP) === 0) {
            mongo_data_system.siteadmins(function(err, users) {
                res.send(users);
            });
        } else {
            res.status(403).send("Not Authorized");
        }
    }); 

    app.get('/managedOrgs', function(req, res) {
        orgsvc.managedOrgs(req, res);
    });

    app.post('/addOrg', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            orgsvc.addOrg(req, res);
        } else {
            res.status(403).send("You are not authorized.");                    
        }
    });

    app.post('/updateOrg', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            orgsvc.updateOrg(req, res);
        } else {
            res.status(403).send("You are not authorized to update this organization.");                    
        }
    });
    
    app.get('/user/me', function(req, res) {
        if (!req.user) {
            res.send("Not logged in.");
        } else {
            mongo_data_system.userById(req.user._id, function(err, user) {
                res.send(user);
            });
        }
    });    
    
    app.post('/user/me', function(req, res) {
        if (!req.user) {
            res.status(403).send("Not authorized");
        } else {
            if (req.user._id.toString() !== req.body._id) {
                res.status(403).send("Not authorized");
            } else {
                mongo_data_system.userById(req.user._id, function(err, user) {
                    user.email = req.body.email;
                    user.save(function(err, u) {
                        if (err) res.status(500).send("Unable to save");
                        res.send("OK");
                    });
                });
            }
        }
    });

    app.post('/addSiteAdmin', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            usersrvc.addSiteAdmin(req, res);
        } else {
            res.status(403).send("You are not authorized.");                    
        }
    });

    app.post('/removeSiteAdmin', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            usersrvc.removeSiteAdmin(req, res);
        } else {
            res.status(403).send("You are not authorized.");                    
        }
    });

    app.get('/myOrgsAdmins', function(req, res) {
        usersrvc.myOrgsAdmins(req, res);
    });


    app.get('/orgAdmins', function(req, res) {
        usersrvc.orgAdmins(req, res);
    });

    app.get('/orgCurators', function(req, res) {
        usersrvc.orgCurators(req, res);
    });

    app.post('/addOrgAdmin', function(req, res) {
        if (req.isAuthenticated() && (req.user.siteAdmin || req.user.orgAdmin.indexOf(req.body.org) >= 0)) {
            usersrvc.addOrgAdmin(req, res);
        } else {
            res.status(403).send("You are not authorized.");                    
        }
    });

    app.isLocalIp = function (ip) {
        return ip.indexOf("127.0") === 0 || ip.indexOf(config.internalIP) === 0;
    };

    app.get('/siteaudit', function(req, res) {
        if (app.isLocalIp(req.ip) 
                && req.user && req.user.siteAdmin) {
            res.render('siteAudit', 'system'); //TODO: REMOVE DEPENDENCY
        } else {
            res.status(403).send("Not Authorized");
        }
    });

    app.get('/searchUsers/:username?', function(req, res) {
        if (app.isLocalIp(req.ip) 
                && req.user && req.user.siteAdmin) {
            mongo_data_system.usersByPartialName(req.params.username, function (err, users) {
                res.send({users: users});
            });
        } else {
            res.status(403).send("Not Authorized");
        }
    });

    app.post('/removeOrgAdmin', function(req, res) {
        if (req.isAuthenticated() && (req.user.siteAdmin || req.user.orgAdmin.indexOf(req.body.orgName) >= 0)) {        
            usersrvc.removeOrgAdmin(req, res);
        } else {
            res.status(403).send("You are not authorized.");                    
        }
    });

    app.post('/addOrgCurator', function(req, res) {
        if (req.isAuthenticated() && (req.user.siteAdmin || req.user.orgAdmin.indexOf(req.body.org) >= 0)) {
            usersrvc.addOrgCurator(req, res);
        } else {
            res.status(403).send("You are not authorized.");                    
        }
    });

    app.post('/removeOrgCurator', function(req, res) {
        if (req.isAuthenticated() && (req.user.siteAdmin || req.user.orgAdmin.indexOf(req.body.orgName) >= 0)) {
            usersrvc.removeOrgCurator(req, res);
        } else {
            res.status(403).send("You are not authorized.");                    
        }
    });    

    app.post('/updateUserRoles', function(req, res) {  
        if (req.isAuthenticated() && req.user.siteAdmin) {
            usersrvc.updateUserRoles(req.body, function(err) {
                if (err) res.status(500).end();
                else res.status(200).end();
            });
        } else {
            res.status(403).send("You are not authorized.");                    
        }
    });    


    app.get('/siteaccountmanagement', exports.nocacheMiddleware, function(req, res) {
        var ip = req.ip;
        if (ip.indexOf("127.0") === 0 || ip.indexOf(config.internalIP) === 0) {
            res.render('siteaccountmanagement', "system");
        } else {
            res.status(403).send("Not Authorized");
        }
    });

    app.get('/orgaccountmanagement', exports.nocacheMiddleware, function(req, res) {
        res.render('orgAccountManagement', "system");
    });    
        
    app.get('/data/:imgtag', function(req, res) {
        mongo_data_system.getFile(res, req.params.imgtag);
    });    

    app.post('/classification/elt', function(req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) {
            res.status(403).send("Not Authorized");
            return;
        }      
        classificationNode.cdeClassification(req.body, classificationShared.actions.create, function(err) {
            if (!err) { 
                res.send({ code: 200, msg: "Classification Added"}); 
            } else {
                res.send({ code: 403, msg: "Classification Already Exists"}); 
            }

        });
    });
    
    app.delete('/classification/elt', function(req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.query.orgName)) {
            res.status(403).send("Not Authorized");
            return;
        }  
        classificationNode.cdeClassification(req.query, classificationShared.actions.delete, function(err) {
            if (!err) { 
                res.end(); 
            } else {
                res.status(202).send({error: {message: "Classification does not exists."}});
            }
        });
    });  
    
    app.delete('/classification/org', function(req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.query.orgName)) {
            res.status(403).end();
            return;
        }  
        classificationNode.modifyOrgClassification(req.query, classificationShared.actions.delete, function(err, org) {
            res.send(org);
        });
    });

    app.post('/classification/org', function(req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) {
            res.status(403).end();
            return;
        }      
        classificationNode.addOrgClassification(req.body, function(err, org) {
            res.send(org);
        });
    });

    app.post('/classification/rename', function(req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.orgName)) {
            res.status(403).send("Not Authorized");
            return;
        }      
        classificationNode.modifyOrgClassification(req.body, classificationShared.actions.rename, function(err, org) {
            if (!err) res.send(org);
            else res.status(202).send({error: {message: "Classification does not exists."}});
        });
    });    
 
    app.post('/classifyEntireSearch', function(req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.newClassification.orgName)) {
            res.status(403).send("Not Authorized");
            return;
        }      
        classificationNode.classifyEntireSearch(req.body, function(err) {
            if (!err) res.end();
            else res.status(202).send({error: {message: err}});
        });        
    });

    app.post('/transferSteward', function(req, res) {
        orgsvc.transferSteward(req, res);
    });
    
    app.post('/classification/bulk/tinyid', function(req, res) {
        if (!usersrvc.isCuratorOf(req.user, req.body.classification.orgName)) {
            res.status(403).send("Not Authorized");
            return;
        }        
        var action = function(elt, actionCallback) {
            var classifReq = {
                orgName: req.body.classification.orgName
                , categories: req.body.classification.categories
                , tinyId: elt.id || elt
                , version: elt.version || null
            };          
            classificationNode.cdeClassification(classifReq, classificationShared.actions.create, actionCallback);  
        };        
        adminItemSvc.bulkAction(req.body.elements, action, function(err) {
            var elts = req.body.elements.map(function(e){ 
                return e.id;
            });
            adminItemSvc.bulkAction(elts, action, function(err) {
                if (!err) res.end();
                else res.status(202).send({error: {message: err}});
            });                
        });        
    });    

    app.get('/rsStatus', function(req, res) {
        mongo_data_system.rsStatus(function(err, st) {
            if (err) res.status(500).end(err);
            else res.send(st);
        });
    });

    app.get('/rsConf', function(req, res) {
        mongo_data_system.rsConf(function(err, doc) {
            if (err) res.status(500).end(err);
            else res.send(doc);
        });
    });

    app.post('/nccsPrimary', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            var force = req.body.force === true;
            mongo_data_system.switchToReplSet(config.nccsPrimaryRepl, force, function(err, doc) {
                if (err) res.status(500).end(err);
                else res.send(doc);
            });
        } else {
            res.status(403).send("Not Authorized");
        }
    });

    app.post('/occsPrimary', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            mongo_data_system.switchToReplSet(config.occsPrimaryRepl, false, function(err, doc) {
                if (err) res.status(500).end(err);
                else res.send(doc);
            });
        } else {
            res.status(403).send("Not Authorized");
        }
    });
    
    app.get('/getAllUsernames', function(req, res) {
        if(auth.isSiteOrgAdmin(req)) {
            usersrvc.getAllUsernames(req, res);
        } else {
            res.status(403).send("Not Authorized");
        }
    });
    
    app.post('/getServerErrors', function(req, res) {
        if(req.isAuthenticated() && req.user.siteAdmin) {
            dbLogger.getServerErrors(req.body, function(err, result) {
                res.send(result);                
            });
        } else {
            res.status(403).send("Not Authorized");
        }
    }); 
    
    app.post('/getClientErrors', function(req, res) {
        if(req.isAuthenticated() && req.user.siteAdmin) {
            dbLogger.getClientErrors(req.body, function(err, result) {
                res.send(result);                
            });
        } else {
            res.status(403).send("Not Authorized");
        }
    });   
    
    
    app.post('/logClientException', function(req, res) {
        dbLogger.logClientError(req.body, function(err, result) {
            res.send(result);                
        });
    });  
    
    app.get('/triggerServerErrorExpress', function(req, res) {
        res.send("received");
        trigger.error();
    });   
    
    app.get('/triggerServerErrorMongoose', function(req, res) {
        mongo_data_system.orgByName("none", function (result) {
            res.send("received");
            trigger.error();
        });
    });   
    
    app.post('/mail/messages/new', function(req, res) {
        if (req.isAuthenticated()) {
            var message = req.body;
            if (message.author.authorType === "user") {
                message.author.name = req.user.username;
            }
            message.date = new Date();
            mongo_data_system.createMessage(message, function() {
              res.send();
            });
        } else {
            res.send(401, "Not Authorized");
        }
    });

    app.post('/mail/messages/update', function(req, res) {
        mongo_data_system.updateMessage(req.body, function(err) {
            if (err) {
                res.statusCode = 404;
                res.send("Error while updating the message");
            } else {
                res.send();
            }
        });
    });

    app.post('/mail/messages/:type', function(req, res) {
        mongo_data_system.getMessages(req, function(err, messages) {
            if (err) res.send(404, err);
            else res.send(messages);
        });
    });    
    
};