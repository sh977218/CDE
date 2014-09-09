var passport = require('passport')
  , mongo_data_system = require('./mongo-data')
  , config = require('config')
  , dbLogger = require('./dbLogger.js')
  , logging = require('./logging.js')
  , orgsvc = require('./orgsvc')
  , usersrvc = require('./usersrvc')
  , express = require('express')
  , path = require('path')
;

exports.nocacheMiddleware = function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
};

exports.init = function(app) {
    var viewConfig = {modules: config.modules};

    app.use("/system/public", express.static(path.join(__dirname, '../public')));
    
    app.get('/template/:module/:template', function(req, res) {
        res.render(req.params.template, req.params.module);
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
                res.send(403, 'Failed to get list of orgs detailed info.');
            } else {
                res.send(orgs);
            }   
        });
    });

    app.post('/login', function(req, res, next) {
        // Regenerate is used so appscan won't complain
        req.session.regenerate(function(err) {  
            passport.authenticate('local', function(err, user, info) {
                if (err) { return next(err); }
                if (!user) { 
                    return res.send(info.message);
                }
                req.logIn(user, function(err) {
                    if (err) { return next(err); }
                    req.session.passport = {user: req.user._id};
                    return res.send("OK");
                });
            })(req, res, next);
        });
    });

    app.get('/logout', function(req, res) {
        if (!req.session) {
            return res.redirect('/');
        } 
        req.session.destroy(function (err) {
            req.logout();
            res.clearCookie('connect.sid');
            res.redirect('/');
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
            res.send(403, "You are not authorized.");                    
        }
    });
    
    app.get('/logUsageDailyReport', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            dbLogger.usageByDay(function (result) {
                res.send(result);
            });
        } else {
            res.send(403, "You are not authorized.");                    
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
            res.send(403, "You are not authorized.");                    
        }         
    });

    app.get('/siteadmins', function(req, res) {
        var ip = req.ip;
        if (ip.indexOf("127.0") === 0 || ip.indexOf(config.internalIP) === 0) {
            mongo_data_system.siteadmins(function(err, users) {
                res.send(users);
            });
        } else {
            res.send(403, "Not Authorized");
        }
    }); 

    app.get('/managedOrgs', function(req, res) {
        orgsvc.managedOrgs(req, res);
    });

    app.post('/addOrg', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            orgsvc.addOrg(req, res);
        } else {
            res.send(403, "You are not authorized.");                    
        }
    });

    app.post('/updateOrg', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            orgsvc.updateOrg(req, res);
        } else {
            res.send(403, "You are not authorized to update this organization.");                    
        }
    });
    
    app.get('/user/me', function(req, res) {
        if (!req.user) {
            res.send("You must be logged in to do that");
        } else {
            mongo_data_system.userById(req.user._id, function(err, user) {
                res.send(user);
            });
        }
    });    

    app.post('/addSiteAdmin', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            usersrvc.addSiteAdmin(req, res);
        } else {
            res.send(403, "You are not authorized.");                    
        }
    });

    app.post('/removeSiteAdmin', function(req, res) {
        if (req.isAuthenticated() && req.user.siteAdmin) {
            usersrvc.removeSiteAdmin(req, res);
        } else {
            res.send(403, "You are not authorized.");                    
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
            res.send(403, "You are not authorized.");                    
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
            res.send(403, "Not Authorized");
        }
    });

    app.get('/searchUsers/:username?', function(req, res) {
        if (app.isLocalIp(req.ip) 
                && req.user && req.user.siteAdmin) {
            mongo_data_system.usersByPartialName(req.params.username, function (err, users) {
                res.send({users: users});
            });
        } else {
            res.send(403, "Not Authorized");
        }
    });

    app.post('/removeOrgAdmin', function(req, res) {
        if (req.isAuthenticated() && (req.user.siteAdmin || req.user.orgAdmin.indexOf(req.body.orgName) >= 0)) {        
            usersrvc.removeOrgAdmin(req, res);
        } else {
            res.send(403, "You are not authorized.");                    
        }
    });

    app.post('/addOrgCurator', function(req, res) {
        if (req.isAuthenticated() && (req.user.siteAdmin || req.user.orgAdmin.indexOf(req.body.org) >= 0)) {
            usersrvc.addOrgCurator(req, res);
        } else {
            res.send(403, "You are not authorized.");                    
        }
    });

    app.post('/removeOrgCurator', function(req, res) {
        if (req.isAuthenticated() && (req.user.siteAdmin || req.user.orgAdmin.indexOf(req.body.orgName) >= 0)) {
            usersrvc.removeOrgCurator(req, res);
        } else {
            res.send(403, "You are not authorized.");                    
        }
    });    
    
    app.get('/login', exports.nocacheMiddleware, function(req, res) {
        res.render('login', "system", { user: req.user, message: req.flash('error') });
    });

    app.get('/siteaccountmanagement', exports.nocacheMiddleware, function(req, res) {
        var ip = req.ip;
        if (ip.indexOf("127.0") === 0 || ip.indexOf(config.internalIP) === 0) {
            res.render('siteaccountmanagement', "system");
        } else {
            res.send(403, "Not Authorized");
        }
    });


    app.get('/orgaccountmanagement', exports.nocacheMiddleware, function(req, res) {
        res.render('orgAccountManagement', "system");
    });    
          
};