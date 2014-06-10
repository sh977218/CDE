var express = require('express')
  , http = require('http')
  , path = require('path')
  , cdesvc = require('./node-js/cdesvc')
  , boardsvc = require('./node-js/boardsvc')
  , usersvc = require('./node-js/usersvc')
  , orgsvc = require('./node-js/orgsvc')
  , flash = require('connect-flash')
  , passport = require('passport')
  , crypto = require('crypto')
  , LocalStrategy = require('passport-local').Strategy
  , mongo_data = require('./node-js/mongo-data')
  , classificationNode = require('./node-js/classification')
  , util = require('util')
  , xml2js = require('xml2js')
  , vsac = require('./node-js/vsac-io')
  , winston = require('winston')
  , envconfig = require('./envconfig.js')
  , config = require('./config.js')
  , MongoStore = require('./node-js/assets/connect-mongo.js')(express)
  ;

// Global variables
var GLOBALS = {
    logdir : process.env.LOGDIR || envconfig.logdir || __dirname
};

function findById(id, fn) {
    return mongo_data.userById(id, function(err, user) {
        return fn(null, user);
    });
}

function findByUsername(username, fn) {
    return mongo_data.userByName(username, function(err, user) {
        return fn(null, user);
    });
};

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    console.log("user: " + user.username + " " + user.orgAdmin);  
    done(err, user);
  });
});

passport.use(new LocalStrategy({passReqToCallback: true},
  function(req, username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // Find the user by username. If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message. Otherwise, return the
      // authenticated `user`.
        vsac.umlsAuth(username, password, function(result) { 
            this.updateUserOnLogin = function(req, user) {
                user.lockCounter = 0;
                user.lastLogin = Date.now();
                if (!user.knowIPs) {
                    user.knownIPs = [];
                }
                if (user.knownIPs.length > 100) {
                    user.knownIPs.pop();
                }
                if (user.knownIPs.indexOf(req.ip) < 0) {
                    user.knownIPs.unshift(req.ip);
                };
            };
            if (result.indexOf("true") > 0) {
                findByUsername(username, function(err, user) {
                    if (err) { return done(err); }
                    // username password combo is good, but user is not here, so register him.
                    if (!user) {
                        mongo_data.addUser({username: username, password: "umls", quota: 1024 * 1024 * 1024}, function(newUser) {
                            return done(null, newUser);
                        });
                    } else {
                        this.updateUserOnLogin(req, user);
                        return mongo_data.save(user, function(err, user) {
                            return done(null, user);
                        });
                    }
                });
            } else {
                findByUsername(username, function(err, user) {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false, { message: 'Incorrect username or password' }); }
                    if (user.lockCounter == 3) {
                        return done(null, false, { message: 'User is locked out' }); 
                    }
                    if (user.password != password) {
                        user.lockCounter = user.lockCounter + 1;
                        return mongo_data.save(user, function(err, user) {
                            return done(null, false, { message: 'Invalid password' }); 
                        });
                    }
                    this.updateUserOnLogin(req, user);
                    return mongo_data.save(user, function(err, user) {
                        return done(null, user);                    
                    });
                });                
            };
        });
    });
  }
));

var app = express();

var expressLogger = new (winston.Logger)({
  transports: [
    new winston.transports.File({
      json: true,
      colorize: true
      , level: 'verbose'
      , filename: GLOBALS.logdir + "/expressLog.log"
      , maxsize: 10000000
      , maxFiles: 10
    })
    , new winston.transports.Console(
        {
            level: 'verbose',
            colorize: true,
            timestamp: true
        })          
  ]
});
var expressErrorLogger = new (winston.Logger)({
  transports: [
    new winston.transports.File({
      json: true,
      colorize: true
      , level: 'warn'
      , filename: GLOBALS.logdir + "/expressErrorLog.log"
      , maxsize: 10000000
      , maxFiles: 10
    })
  ]
});

process.on('uncaughtException', function (err) {
  expressErrorLogger.error('Caught exception: ' + err.stack);
});

var winstonStream = {
    write: function(message, encoding){
        expressLogger.info(message);
    }
};

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));

// Creates session store
var mongoHost = process.env.MONGO_HOST || envconfig.mongo_host || '127.0.0.1';
var sessionStore = new MongoStore({
    mongoose_connection: mongo_data.mongoose_connection  
});
app.use(express.session({ secret: "omgnodeworks", store:sessionStore }));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.logger({stream:winstonStream}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use("/shared", express.static("shared", path.join(__dirname, 'shared')));

app.use(function(err, req, res, next){
  expressErrorLogger.error(err.stack);
  console.log(err.stack);
  res.send(500, 'Something broke!');
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
};

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
      return next(); 
  }
  res.redirect('/login');
};

app.get('/gonowhere', function(req, res) {
   res.send("<html><body>Nothing here</body></html>"); 
});

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/home', function(req, res) {
  res.render('home');
});

app.get('/exportCdeSearch', function(req, res) {
  res.render('cdeExport');
});

app.get('/list', function(req, res){
  res.render('list');
});

app.get('/boardList', function(req, res){
  res.render('boardList');
});

app.get('/deCompare', function(req, res){
  res.render('deCompare');
});

app.get('/listboards', function(req, res) {
   boardsvc.boardList(req, res); 
});

app.get('/signup', function(req, res){
  res.render('signup');
});

function checkCdeOwnership(deId, req, cb) {
    this.userSessionExists = function(req) {
        return req.user;
    };
    this.isCuratorOrAdmin = function(req, de) {
        return (req.user.orgAdmin && req.user.orgAdmin.indexOf(de.stewardOrg.name) < 0)
               || (req.user.orgCurator && req.user.orgCurator.indexOf(de.stewardOrg.name) < 0);
    };
    var authorization = this;
    if (req.isAuthenticated()) {
        mongo_data.cdeById(deId, function (err, de) {
            if (err) {
                return cb("Data Element does not exist.", null);
            }
            if (!authorization.userSessionExists(req)
               || !authorization.isCuratorOrAdmin(req, de)
               ) {
                return cb("You do not own this data element.", null);
            } else {
                cb(null, de);
            }
        });
    } else {
        return cb("You are not authorized.", null);                   
    }
}

app.post('/addSiteAdmin', function(req, res) {
    if (req.isAuthenticated() && req.user.siteAdmin) {
        usersvc.addSiteAdmin(req, res);
    } else {
        res.send(403, "You are not authorized.");                    
    }
});

app.post('/removeSiteAdmin', function(req, res) {
    if (req.isAuthenticated() && req.user.siteAdmin) {
        usersvc.removeSiteAdmin(req, res);
    } else {
        res.send(403, "You are not authorized.");                    
    }
});

app.get('/myOrgsAdmins', function(req, res) {
    usersvc.myOrgsAdmins(req, res);
});


app.get('/orgAdmins', function(req, res) {
    usersvc.orgAdmins(req, res);
});

app.get('/orgCurators', function(req, res) {
    usersvc.orgCurators(req, res);
});

app.post('/addOrgAdmin', function(req, res) {
    if (req.isAuthenticated() && (req.user.siteAdmin || req.user.orgAdmin.indexOf(req.body.org) >= 0)) {
        usersvc.addOrgAdmin(req, res);
    } else {
        res.send(403, "You are not authorized.");                    
    }
});

app.post('/removeOrgAdmin', function(req, res) {
    if (req.isAuthenticated() && (req.user.siteAdmin || req.user.orgAdmin.indexOf(req.body.orgName) >= 0)) {        
        usersvc.removeOrgAdmin(req, res);
    } else {
        res.send(403, "You are not authorized.");                    
    }
});

app.post('/addOrgCurator', function(req, res) {
    if (req.isAuthenticated() && (req.user.siteAdmin || req.user.orgAdmin.indexOf(req.body.org) >= 0)) {
        usersvc.addOrgCurator(req, res);
    } else {
        res.send(403, "You are not authorized.");                    
    }
});

app.post('/removeOrgCurator', function(req, res) {
    if (req.isAuthenticated() && (req.user.siteAdmin || req.user.orgAdmin.indexOf(req.body.orgName) >= 0)) {
        usersvc.removeOrgCurator(req, res);
    } else {
        res.send(403, "You are not authorized.");                    
    }
});

app.get('/createcde', function(req, res) {
   res.render('createcde'); 
});

app.get('/cdereview', function(req, res) {
    res.render('cdereview');
});

app.get('/siteaccountmanagement', function(req, res) {
    var ip = req.ip;
    if (ip.indexOf("127.0") === 0 || ip.indexOf(config.internalIP) === 0) {
        res.render('siteaccountmanagement');
    } else {
        res.send(403, "Not Authorized");
    }
});

app.isLocalIp = function (ip) {
    return ip.indexOf("127.0") === 0 || ip.indexOf(config.internalIP) === 0;
};

app.get('/siteaudit', function(req, res) {
    if (app.isLocalIp(req.ip) 
            && req.user && req.user.siteAdmin) {
        res.render('siteAudit');
    } else {
        res.send(403, "Not Authorized");
    }
});

app.get('/searchUsers/:username?', function(req, res) {
    if (app.isLocalIp(req.ip) 
            && req.user && req.user.siteAdmin) {
        mongo_data.usersByPartialName(req.params.username, function (err, users) {
            res.send({users: users});
        });
    } else {
        res.send(403, "Not Authorized");
    }
});

app.get('/orgaccountmanagement', function(req, res) {
    res.render('orgAccountManagement');
});

app.get('/classificationmanagement', function(req, res) {
    res.render('classificationManagement');
});

app.get('/deview', function(req, res) {
    res.render("deview");
});

app.get('/login', function(req, res) {
   res.render('login', { user: req.user, message: req.flash('error') });
});

app.get('/profile', function(req, res) {
   res.render("profile"); 
});

app.get('/myboards', function(req, res) {
   res.render("myBoards"); 
});

app.post('/login', function(req, res, next) {
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
  req.session.destroy(function (err) {
      req.logout();
      res.redirect('/');
  });
});

app.get('/listcde', function(req, res) {
    cdesvc.listcde(req, res);
});

app.post('/cdesByUuidList', function(req, res) {
    mongo_data.cdesByUuidList(req.body, function(err, cdes) {
        res.send(cdes);
    });
});

app.get('/cdesforapproval', function(req, res) {
    mongo_data.cdesforapproval(req.user.orgAdmin, function(err, cdes) {
        res.send(cdes);
    });
});

app.get('/siteadmins', function(req, res) {
    var ip = req.ip;
    if (ip.indexOf("127.0") === 0 || ip.indexOf(config.internalIP) === 0) {
        mongo_data.siteadmins(function(err, users) {
            res.send(users);
        });
    } else {
        res.send(403, "Not Authorized");
    }
});

app.get('/listOrgs', function(req, res) {
    cdesvc.listOrgs(req, res);
});

app.get('/listOrgsFromDEClassification', function(req, res) {
    cdesvc.listOrgsFromDEClassification(req, res);
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

app.delete('/classification/org', function(req, res) {
    if (!app.isCuratorOf(req.user, req.query.orgName)) {
        res.send(403);
        return;
    }  
    classificationNode.removeOrgClassification(req.query, function() {
        res.send();
    });
});

app.post('/classification/org', function(req, res) {
    if (!app.isCuratorOf(req.user, req.body.orgName)) {
        res.send(403);
        return;
    }      
    classificationNode.addOrgClassification(req.body, function() {
        res.send();
    });
});

app.delete('/classification/cde', function(req, res) {
    if (!app.isCuratorOf(req.user, req.query.orgName)) {
        res.send(403);
        return;
    }  
    classificationNode.cdeClassification(req.query, "remove", function(err) {
        if (!err) { 
            res.send(); 
        } else {
            res.status(409);
            res.send();
        }
    });
});

app.post('/classification/cde', function(req, res) {
    if (!app.isCuratorOf(req.user, req.body.orgName)) {
        res.send(403);
        return;
    }      
    classificationNode.cdeClassification(req.body, "add", function(err) {
        if (!err) { 
            res.send(); 
        } else {
            res.status(409);
            res.send();
        }
        
    });
});

app.post('/addComment', function(req, res) {
    if (req.isAuthenticated()) {
        mongo_data.addComment(req.body.deId, req.body.comment, req.user._id, function (err, de) {
            if (err) {
                res.send(err);
                return;
            }
            res.send({message: "Comment added", de: de});
        });
    } else {
        res.send({message: "You are not authorized."});                   
    }
});

app.post('/removeComment', function(req, res) {
    if (req.isAuthenticated()) {
        mongo_data.cdeById(req.body.deId, function (err, de) {
            if (err) {
                res.send("Data Element does not exist.");
            }
            for (var c in de.comments) {
                var comment = de.comments[c];
                if (comment._id == req.body.commentId) {
                    if( req.user._id == comment.user || 
                        (req.user.orgAdmin.indexOf(de.stewardOrg.name) > -1) ||
                        req.user.siteAdmin
                    ) {
                        de.comments.splice(c, 1);
                        de.save(function (err) {
                           if (err) {
                               res.send({message: err});
                           } else {
                               res.send({message: "Comment removed", de: de});
                           }
                        });                        
                    } else {
                        res.send({message: "You can only remove comments you own."});
                    }
                }
            }
        });
    } else {
        res.send("You are not authorized.");                   
    }
});

app.get('/priorcdes/:id', function(req, res) {
    cdesvc.priorCdes(req, res);
});

app.get('/dataelement/:id/:type?', function(req, res) {
    cdesvc.show(req, res);
});

app.get('/debyuuid/:uuid/:version', function(req, res) {
    mongo_data.deByUuidAndVersion(req.params.uuid, req.params.version, function(err, de) {
        res.send(de);
    });
});

app.post('/dataelement', function (req, res) {
    return cdesvc.save(req, res);
});

app.get('/user/me', function(req, res) {
    if (!req.user) {
        res.send("You must be logged in to do that");
    } else {
        mongo_data.userById(req.user._id, function(err, user) {
            res.send(user);
        });
    }
});

app.get('/viewingHistory/:start', function(req, res) {
    if (!req.user) {
        res.send("You must be logged in to do that");
    } else {
        var splicedArray = splicedArray = req.user.viewHistory.splice(req.params.start, 10);
        var idList = [];
        for (var i = 0; i < splicedArray.length; i++) {
            idList.push(splicedArray[i]);
        }
        mongo_data.cdesByIdList(idList, function(err, cdes) {
            res.send(cdes);
        });
    }
});

app.get('/boards/:userId', function(req, res) {
    mongo_data.boardsByUserId(req.params.userId, function(result) {
        res.send(result);
    });
});

app.get('/deBoards/:uuid', function(req, res) {
   mongo_data.publicBoardsByDeUuid(req.params.uuid, function (result) {
        res.send(result);
   });
});

app.get('/board', function(req, res) {
   res.render("boardView"); 
});

app.get('/board/:boardId/:start', function(req, res) {
    mongo_data.boardById(req.params.boardId, function (err, board) {
        if (board.shareStatus !== "Public") {
            if (!req.isAuthenticated() || (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id))) {
                return res.send("This board is private");
            }
        }
        var totalItems = board.pins.length;
        var pins = board.pins.splice(req.params.start, 20); 
        board.pins = pins;
        var idList = [];
        for (var i = 0; i < pins.length; i++) {
            idList.push(pins[i].deUuid);
        }
        mongo_data.cdesByUuidList(idList, function(err, cdes) {
            res.send({board: board, cdes: cdes, totalItems: totalItems});
        });
    });
});

app.post('/board', function(req, res) {
    if (req.isAuthenticated()) {
        var board = req.body;
        if (!board._id) {
            board.createdDate = Date.now();
            board.owner = {
                userId: req.user._id
                , username: req.user.username
            };
            return mongo_data.newBoard(board, function(err, newBoard) {
               res.send(newBoard); 
            });
        } else  {
            mongo_data.boardById(board._id, function(err, b) {
                if (err) console.log(err);
                b.name = board.name;
                b.description = board.description;
                b.shareStatus = board.shareStatus;
                return mongo_data.save(b, function(err) {
                    if (err) console.log(err);
                    res.send(b);
                });                
            });
        }
    } else {
        res.send("You must be logged in to do this.");
    }
});

app.delete('/board/:boardId', function (req, res) {
    if (req.isAuthenticated()) {
        mongo_data.boardById(req.params.boardId, function (err, board) {
            if (JSON.stringify(board.owner.userId) !== JSON.stringify(req.user._id)) {
                res.send("You must own the board that you wish to delete.");
            }
            mongo_data.removeBoard(req.params.boardId, function (err) {
                res.send("Board Removed.");
            });
        });
    } else {
        res.send("You must be logged in to do this.");
    }
});

// Check that apache will support delete
app.delete('/pincde/:pinId/:boardId', function(req, res) {
   if (req.isAuthenticated()) {
       usersvc.removePinFromBoard(req, res);
   } else {
       res.send("Please login first.");
   }
});

app.put('/pincde/:uuid/:boardId', function(req, res) {
   if (req.isAuthenticated()) {
       usersvc.pinToBoard(req, res);
   } else {
       res.send("Please login first.");
   }
});

app.get('/autocomplete/:name', function(req, res) {
    return cdesvc.name_autocomplete(req.params.name, res);
});

app.get('/autocomplete/classification/all', function (req, res) {
    mongo_data.conceptSystem_autocomplete(function (result) {
        res.send(result);
    });
});

app.get('/autocomplete/classification/org/:orgName', function (req, res) {
    mongo_data.conceptSystem_org_autocomplete(req.params.orgName, function (result) {
        res.send(result);
    });
});

app.get('/autocomplete/org/:name', function (req, res) {
    mongo_data.org_autocomplete(req.params.name, function (result) {
        res.send(result);
    });
});

app.get('/cdediff/:deId', function(req, res) {
   return cdesvc.diff(req, res); 
});

app.get('/classificationSystems', function(req, res) {
   return mongo_data.classificationSystems(function (result) {
       res.send(result);
   }); 
});

app.get('/org/:name', function(req, res) {
   return mongo_data.orgByName(req.params.name, function (result) {
       res.send(result);
   }); 
});

app.post('/elasticSearch', function(req, res) {
   return cdesvc.elasticsearch(req.body.query, res); 
});

app.post('/addAttachmentToCde', function(req, res) {
    checkCdeOwnership(req.body.de_id, req, function(err, de) {
        if (err) return res.send(err);
        mongo_data.userTotalSpace(req.user.username, function(totalSpace) {
            if (totalSpace > req.user.quota) {
                res.send({message: "You have exceeded your quota"});
            } else {
                mongo_data.addCdeAttachment(req.files.uploadedFiles, req.user, "some comment", de, function() {
                    res.send(de);            
                 });                                            
            }
        });
    });
});

app.isCuratorOf = function(user, orgName){
    if (!user) return false;
    return user.orgCurator.indexOf(orgName)>-1 || user.orgAdmin.indexOf(orgName)>-1 || user.siteAdmin;
};

app.post('/classification/cde/addlist', function(req, res) {
    classificationNode.addList(req.body, function(err) {
       if(!err) res.send();
    });
});

app.post('/addProperty', function(req, res) {
    checkCdeOwnership(req.body.deId, req, function(err, de) {
        if (err) return res.send({error: err});  
        var property = req.body.property;
        if (property === undefined || property.key === undefined || property.value === undefined) {
            res.send({error: "Incorrect parameter"});
        }
        if (de.properties === undefined) {
            de.properties = [];
        } else {
            for (var i = 0; i < de.properties.length; i++) {
                if (de.properties[i].key === property.key) {
                    return res.send({error: "This property already exists."});
                }
            }
        }
        de.properties.push(property);
        return de.save(function(err) {
            if (err) {
                res.send({error: err});
            } else {
                res.send({de: de});
            }
        });
    });    
});

app.post("/removeProperty", function(req, res) {
    checkCdeOwnership(req.body.deId, req, function(err, de) {
        if (err) return res.send({error: err});  
        de.properties.splice(req.body.index, 1);
        return de.save(function(err) {
            if (err) {
                res.send({error: err});
            } else {
                res.send({de: de});
            }
        });        
    });    
});

app.post('/addId', function(req, res) {
    checkCdeOwnership(req.body.deId, req, function(err, de) {
        if (err) return res.send(403, {error: err});  
        var newId = req.body.newId;
        if (newId === undefined || newId.origin === undefined || newId.id === undefined) {
            res.send(406, {error: "Incorrect parameter"});
        }
        if (de.ids === undefined) {
            de.ids = [];
        } 
        de.ids.push(newId);
        return de.save(function(err) {
            if (err) {
                res.send(406,{error: err});
            } else {
                res.send({de: de});
            }
        });
    });    
});

app.post("/removeId", function(req, res) {
    checkCdeOwnership(req.body.deId, req, function(err, de) {
        if (err) return res.send(403, {error: err});  
        de.ids.splice(req.body.index, 1);
        return de.save(function(err) {
            if (err) {
                res.send(406, {error: err});
            } else {
                res.send({de: de});
            }
        });        
    });    
});

app.post('/addUsedBy', function(req, res) {
    checkCdeOwnership(req.body.deId, req, function(err, de) {
        if (err) return res.send({error: err});  
        de.usedByOrgs.push(req.body.usedBy);
        return de.save(function(err) {
            if (err) {
                res.send("error: " + err);
            } else {
                res.send(de);
            }
        });
    });
});

app.post('/removeUsedBy', function(req, res) {
    checkCdeOwnership(req.body.deId, req, function(err, de) {
        if (err) return res.send(err);  
        var toRemove = req.body.usedBy;
        for (var i = 0; i < de.usedByOrgs.length; i++) {
            if (de.usedByOrgs[i] === toRemove) {
                de.usedByOrgs.splice(i, 1);
                return de.save(function(err) {
                    if (err) {
                        res.send("error: " + err);
                    } else {
                        res.send(de);
                    }
                });
            }
        }
        res.send("Not found.");
    });
});

app.get('/orgNames', function(req, res) {
   mongo_data.orgNames(function (err, names) {
       res.send(names);
   }) 
});

app.post('/removeAttachment', function(req, res) {
    checkCdeOwnership(req.body.deId, req, function(err, de) {
        if (err) return res.send(err);  
        de.attachments.splice(index, 1);
        de.save(function (err) {
           if (err) {
               res.send("error: " + err);
           } else {
               res.send(de);
           }
        });
    });
});

app.post('/setAttachmentDefault', function(req, res) {
    checkCdeOwnership(req.body.deId, req, function(err, de) {
        if (err) {
            expressLogger.info(err);
            return res.send(err);
        }  
        var state = req.body.state;
        for (var i = 0; i < de.attachments.length; i++) {
            de.attachments[i].isDefault = false;
        }
        de.attachments[req.body.index].isDefault = state;
        de.save(function (err) {
           if (err) {
               res.send("error: " + err);
           } else {
               res.send(de);
           }
        });
    });
});

app.get('/userTotalSpace/:uname', function(req, res) {
   return mongo_data.userTotalSpace(req.params.uname, function(space) {
       return res.send({username: req.params.uname, totalSize: space});
   });
});


app.get('/data/:imgtag', function(req, res) {
  mongo_data.getFile( function(error,data) {
     res.writeHead('200', {'Content-Type': 'image/png'});
     res.end(data,'binary');
  }, res, req.params.imgtag );
});

app.get('/moreLikeCde/:cdeId', function(req, res) {
    cdesvc.morelike(req.params.cdeId, function(result) {
        res.send(result);
    });
});

app.post('/desByConcept', function(req, res) {
   mongo_data.desByConcept(req.body, function(result) {
       res.send(result);
   }); 
});

app.get('/deCount', function(req, res) {
   mongo_data.deCount(function (result) {
       console.log(result);
       res.send({count: result});
   });
});

var fetchRemoteData = function() {
    vsac.getTGT(function(tgt) {
        console.log("Got TGT");
    });
    mongo_data.fetchPVCodeSystemList();   
};

// run every 1 hours
fetchRemoteData();
setInterval(fetchRemoteData, 1000 * 60 * 60 * 1);

var parser = new xml2js.Parser();
app.get('/vsacBridge/:vsacId', function(req, res) {
   vsac.getValueSet(req.params.vsacId, function(result) {       
       if (result === 404 || result === 400) {
           res.status(result);
           res.end();
       } else {
           parser.parseString(result, function (err, jsonResult) {
            res.send(jsonResult);
           });
       }
   }) ;
});

app.get('/permissibleValueCodeSystemList', function(req, res) {
    res.send(mongo_data.pVCodeSystemList);
});

app.post('/mail/messages/new', function(req, res) {
    mongo_data.createMessage(req.body, function() {
        res.send();
    });    
});

app.post('/mail/messages/update', function(req, res) {
    mongo_data.updateMessage(req.body, function(err) {
        if (err) {
            res.statusCode = 404;
            res.send("Error while updating the message");
        } else {
            res.send();
        }
    });
});

app.get('/mail/template/inbox', function(req, res) {
    res.render("inbox"); 
});

app.post('/mail/messages/:type', function(req, res) {
    mongo_data.getMessages(req, function(err, messages) {
        if (err) res.send(404, err);
        else res.send(messages);
    });
});

app.post('/retireCde', function (req, res) {
    req.params.type = "received";
    mongo_data.cdeById(req.body._id, function(err, cde) {
        if (err != "") res.send(404, err);
        if (!cde.registrationState.administrativeStatus === "Retire Candidate") return res.send(409, "CDE is not a Retire Candidate");
        cde.registrationState.registrationStatus = "Retired";
        delete cde.registrationState.administrativeStatus;
        cde.save(function() {
            res.send();
        });        
    });
});

var systemAlert = "";
app.get("/systemAlert", function(req, res) {
    res.send(systemAlert);
});

app.post("/systemAlert", function(req, res) {
    if (req.isAuthenticated() && req.user.siteAdmin) {
        systemAlert = req.body.alert;
        console.log("system: " + systemAlert);
        res.send("OK");
    } else {
        res.send(401, "Not Authorized");
    };
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

