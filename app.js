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
  , util = require('util')
  , xml2js = require('xml2js')
  , vsac = require('./node-js/vsac-io')
  , winston = require('winston')
  , envconfig = require('./envconfig.js')
  ;

var logdir = process.env.LOGDIR || envconfig.logdir || __dirname;

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

passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // Find the user by username. If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message. Otherwise, return the
      // authenticated `user`.
        vsac.umlsAuth(username, password, function(result) {            
            if (result.indexOf("true") > 0) {
                findByUsername(username, function(err, user) {
                    if (err) { return done(err); }
                    // username password combo is good, but user is not here, so register him.
                    if (!user) {
                        mongo_data.addUser({username: username, password: "umls", quota: 1024 * 1024 * 1024}, function(newUser) {
                            return done(null, newUser);
                        });
                    } else {
                        return done(null, user);
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
                    user.lockCounter = 0;
                    user.lastLogin = Date.now();
                    return mongo_data.save(user, function(err, user) {
                        return done(null, user);                    
                    });
                })                
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
      , filename: logdir + "/expressLog.log"
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
      , filename: logdir + "/expressErrorLog.log"
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
app.use(function noCachePlease(req, res, next) {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", -1);
    next();
  });
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({ secret: 'omgnodeworks' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.logger({stream:winstonStream}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
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

app.post('/register', function(req, res) {
  usersvc.register(req, res);
});

app.post('/addSiteAdmin', function(req, res) {
    usersvc.addSiteAdmin(req, res);
});

app.post('/removeSiteAdmin', function(req, res) {
    usersvc.removeSiteAdmin(req, res);
});

app.get('/myOrgsAdmins', function(req, res) {
    usersvc.myOrgsAdmins(req, res);
});


app.get('/orgAdmins', function(req, res) {
    usersvc.orgAdmins(req, res);
});

app.post('/addOrgAdmin', function(req, res) {
    usersvc.addOrgAdmin(req, res);
});

app.post('/removeOrgAdmin', function(req, res) {
    usersvc.removeOrgAdmin(req, res);
});

app.get('/orgCurators', function(req, res) {
    usersvc.orgCurators(req, res);
});

app.post('/addOrgCurator', function(req, res) {
    usersvc.addOrgCurator(req, res);
});

app.post('/removeOrgCurator', function(req, res) {
    usersvc.removeOrgCurator(req, res);
});

app.get('/cart', function(req, res) {
    res.render('cart');
});

app.post('/addtocart/:formId', function(req, res) {
    var user = req.user;
    mongo_data.addToCart(user, req.body.formId, function(err) {
        res.send();    
    });
});

app.post('/removefromcart/:formId', function(req, res) {
    var user = req.user;
    mongo_data.removeFromCart(user, req.body.formId, function(err) {
        res.send();    
    });
});

app.get('/listforms', function(req, res) {
    res.render('listforms', { user: req.user });
});

app.get('/formlist', function(req, res) {
    cdesvc.listform(req, res);
});

app.get('/cartcontent', function(req, res) {
    // @TODO Check for undefined req.user here.
    mongo_data.formsByIdList(req.user.formCart, function(err, forms) {
        res.send({'forms': forms});
    });
});

app.post('/form', function(req, res) {
    return mongo_data.saveForm(req, function(err, form) {
       res.send(form); 
    });
});

app.get('/form/:formId', function(req, res) {
    mongo_data.formById(req.params.formId, function(err, form) {
       res.send(form); 
    });
});

app.get('/createcde', function(req, res) {
   res.render('createcde'); 
});

app.get('/createform', function(req, res) {
    res.render('createform', { user: req.user });
});

app.get('/cdereview', function(req, res) {
    res.render('cdereview');
});

app.get('/siteaccountmanagement', function(req, res) {
    res.render('siteaccountmanagement');
});

app.get('/orgaccountmanagement', function(req, res) {
    res.render('orgAccountManagement');
});

app.get('/classificationmanagement', function(req, res) {
    res.render('classificationManagement');
});

app.get('/formview', function(req, res) {
    res.render('formview', { user: req.user });
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

app.get('/cdesforapproval', function(req, res) {
    mongo_data.cdesforapproval(req.user.orgAdmin, function(err, cdes) {
        res.send(cdes);
    });
});

app.get('/siteadmins', function(req, res) {
    mongo_data.siteadmins(function(err, users) {
        res.send(users);
    });
});

app.get('/listorgs', function(req, res) {
    cdesvc.listOrgs(req, res);
});

app.get('/managedOrgs', function(req, res) {
    orgsvc.managedOrgs(req, res);
});

app.post('/addOrg', function(req, res) {
    orgsvc.addOrg(req, res);
});

app.post('/removeOrg', function(req, res) {
    orgsvc.removeOrg(req, res);
});

app.post('/removeClassificationFromOrg', function(req, res) {
    if (!req.user 
        || (!req.user.orgAdmin || req.user.orgAdmin.indexOf(req.body.stewardOrg.name) < 0)
          && (!req.user.orgCurator || req.user.orgCurator.indexOf(req.body.stewardOrg.name) < 0)
        ) {
        res.send("You are not authorized to do this.");
    } else {
        mongo_data.removeClassificationFromOrg(req.body.stewardOrg.name, req.body.conceptSystem, req.body.concept, function(err) {
            if (err) res.send("error: " + err);
            else res.send("Classification Removed");
        });
    }
});

app.post('/addClassificationToOrg', function(req, res) {
    if (!req.user 
        || (!req.user.orgAdmin || req.user.orgAdmin.indexOf(req.body.stewardOrg.name) < 0)
          && (!req.user.orgCurator || req.user.orgCurator.indexOf(req.body.stewardOrg.name) < 0)
        ) {
        res.send("You are not authorized to do this.");
    } else {
        mongo_data.addClassificationToOrg(req.body.stewardOrg.name, req.body.conceptSystem, req.body.concept, function(err) {
            if (err) res.send("error: " + err);
            else res.send("Classification Added");
        });
    }
});


app.post('/addComment', function(req, res) {
    if (req.isAuthenticated()) {
        mongo_data.addComment(req.body.deId, req.body.comment, req.user._id, function (err) {
            if (err) {
                res.send(err);
                return;
            }
            res.send("Comment added");
        });
    } else {
        res.send("You are not authorized.");                   
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
                    if (req.user._id == comment.user || (req.user.orgAdmin.indexOf(de.stewardOrg.name) > -1)) {
                        de.comments.splice(c, 1);
                        de.save(function (err) {
                           if (err) {
                               res.send("error: " + err);
                           } else {
                               res.send("Comment removed");
                           }
                        });                        
                    } else {
                        res.send("You can only remove comments you own.");
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

app.get('/dataelement/:id', function(req, res) {
    cdesvc.show(req, res);
});

app.get('/debyuuid/:uuid/:version', function(req, res) {
    mongo_data.deByUuidAndVersion(req.params.uuid, req.params.version, function(err, de) {
        res.send(de);
    });
});

// @TODO
// SECURITY LAMENESS HERE
// Check the following:
// 1. You are org owner
// 2. Only site admin can update reg status to standard & pref std.
// 3. If status is already std + above, only site admin can update
// Move all this validation logic to cdesvc. 
app.post('/dataelement', function (req, res) {
    return cdesvc.save(req, res);
});

app.get('/cdesinform/:formId', function(req, res) {
    mongo_data.formById(req.params.formId, function(err, form) {
        if (!form) {
            res.send("The requested form does not exist.");
        } else {
            var idList = [];
            if (form.modules) {
                for (var j = 0; j < form.modules.length; j++) {
                    for (var i = 0; i < form.modules[j].questions.length; i++) {
                        if (form.modules[j].questions[i].dataElement.de_id) {
                            idList.push(form.modules[j].questions[i].dataElement.de_id);
                        }
                    }
                }
            }
            for (var i = 0; i < form.questions.length; i++) {
                if (form.questions[i].dataElement.de_id) {
                    idList.push(form.questions[i].dataElement.de_id);
                }
            }
            mongo_data.cdesByIdList(idList, function(err, cdes) {
                res.send(cdes);
            });
        }
    });
});

app.post('/addcdetoform/:cdeId/:formId', function (req, res) {
  mongo_data.formById(req.body.formId, function(err, form) {
      if (!form) {
          res.send("The requested form does not exist.");
      } else {
          if (!req.user 
                  || (!req.user.orgAdmin || req.user.orgAdmin.indexOf(form.stewardOrg.name) < 0)
                    && (!req.user.orgCurator || req.user.orgCurator.indexOf(form.stewardOrg.name) < 0)
                  ) {
            res.send("You are not authorized to do this.");           
          } else {
            mongo_data.cdeById(req.body.cdeId, function(err, cde) {
                if (!cde) {
                    res.send("The requested CDE does not exist.");
                } else {
                    var question = {
                        value: cde.naming[0].designation
                        , instructions: ''
                        , dataElement: {de_id: cde._id}
                    };
                    form.questions.push(question);
                    mongo_data.save(form, function(err, form) {
                        res.send(form);
                    });
                };
            });
          }
      }
  });
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

app.post('/linktovsac', function (req, res) {
    return cdesvc.linktovsac(req, res);
});

app.get('/autocomplete/:name', function(req, res) {
    return cdesvc.name_autocomplete(req.params.name, res);
});

app.get('/autocomplete/form', function(req, res) {
    return cdesvc.name_autocomplete_form(req, res);
});

app.get('/autocomplete/classification/all', function (req, res) {
    mongo_data.conceptSystem_autocomplete(req.params.conceptSystem, function (result) {
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
    if (req.isAuthenticated()) {
        return mongo_data.cdeById(req.body.de_id, function(err, cde) {
            if (req.user.orgCurator.indexOf(cde.stewardOrg.name) < 0 
                    && req.user.orgAdmin.indexOf(cde.stewardOrg.name) < 0 
                    && !req.user.siteAdmin) {
                res.send("not authorized");
            } else {
                mongo_data.userTotalSpace(req.user.username, function(totalSpace) {
                    if (totalSpace > req.user.quota) {
                        res.send({message: "You have exceeded your quota"});
                    } else {
                        mongo_data.addCdeAttachment(req.files.uploadedFiles, req.user, "some comment", cde, function() {
                            res.send(cde);            
                         });                                            
                    }
                });
                
            }
        });
    } else {
        res.send("You need to be logged in to do this");
    }
});

app.post('/addClassification', function(req, res) {
    if (req.isAuthenticated()) {
        mongo_data.cdeById(req.body.deId, function (err, de) {
            if (err) {
                res.send("Data Element does not exist.");
            }
            if (!req.user 
                  || (!req.user.orgAdmin || req.user.orgAdmin.indexOf(de.stewardOrg.name) < 0)
                    && (!req.user.orgCurator || req.user.orgCurator.indexOf(de.stewardOrg.name) < 0)
                  ) {
                res.send("You do not own this data element.");
            } else {
                de.classification.push(req.body.classification);
                return de.save(function(err) {
                    if (err) {
                        res.send("error: " + err);
                    } else {
                        res.send(de);
                    }
                });
            }
        });
    } else {
        res.send("You are not authorized.");                   
    }
});


app.post('/removeClassification', function(req, res) {
    if (req.isAuthenticated()) {
        mongo_data.cdeById(req.body.deId, function (err, de) {
            if (err) {
                res.send("Data Element does not exist.");
            }
            if (!req.user 
                  || (!req.user.orgAdmin || req.user.orgAdmin.indexOf(de.stewardOrg.name) < 0)
                    && (!req.user.orgCurator || req.user.orgCurator.indexOf(de.stewardOrg.name) < 0)
                  ) {
                res.send("You do not own this data element.");
            } else {
                var toRemove = req.body.classification;
                /*for (var i = 0; i < de.classification.length; i++) {
                    if (de.classification[i].conceptSystem === toRemove.conceptSystem
                            && de.classification[i].concept === toRemove.concept) {
                        de.classification.splice(i, 1);
                        return de.save(function(err) {
                            if (err) {
                                res.send("error: " + err);
                            } else {
                                res.send(de);
                            }
                        });
                    }
                }
                res.send("Not found.");*/
                var findSteward = function(de, orgName) {
                    for (var i = 0; i < de.classification.length; i++) {
                        if (de.classification[i].stewardOrg.name===orgName) {
                            return {index:i, object: de.classification[i]};
                        }
                    }
                };
                var findConcept = function(system, name) {
                    for (var i = 0; i < system.elements.length; i++) {
                        if (system.elements[i].name===name) {
                            //return system.elements[i];
                            return {index:i, object: system.elements[i]};
                        }
                    }
                };                 
                var steward = findSteward(de, req.body.orgName);
                var conceptSystem = findConcept(steward.object, req.body.conceptSystemName);
                var concept = findConcept(conceptSystem.object, req.body.conceptName);
                conceptSystem.object.elements.splice(concept.index);
                if (conceptSystem.object.elements.length===0) {
                    steward.object.elements.splice(conceptSystem.index);
                }
                if (steward.object.elements.length===0) {
                    de.classification.splice(steward.index);
                }       
                de.save();
            }
        });
    } else {
        res.send("You are not authorized.");                   
    }
});

app.post('/addUsedBy', function(req, res) {
    if (req.isAuthenticated()) {
        mongo_data.cdeById(req.body.deId, function (err, de) {
            if (err) {
                res.send("Data Element does not exist.");
            }
            if (!req.user 
                  || (!req.user.orgAdmin || req.user.orgAdmin.indexOf(de.stewardOrg.name) < 0)
                    && (!req.user.orgCurator || req.user.orgCurator.indexOf(de.stewardOrg.name) < 0)
                  ) {
                res.send("You do not own this data element.");
            } else {
                de.usedByOrgs.push(req.body.usedBy);
                return de.save(function(err) {
                    if (err) {
                        res.send("error: " + err);
                    } else {
                        res.send(de);
                    }
                });
            }
        });
    } else {
        res.send("You are not authorized.");                   
    }
});


app.post('/removeUsedBy', function(req, res) {
    if (req.isAuthenticated()) {
        mongo_data.cdeById(req.body.deId, function (err, de) {
            if (err) {
                res.send("Data Element does not exist.");
            }
            if (!req.user 
                  || (!req.user.orgAdmin || req.user.orgAdmin.indexOf(de.stewardOrg.name) < 0)
                    && (!req.user.orgCurator || req.user.orgCurator.indexOf(de.stewardOrg.name) < 0)
                  ) {
                res.send("You do not own this data element.");
            } else {
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
            }
        });
    } else {
        res.send("You are not authorized.");                   
    }
});

app.get('/orgNames', function(req, res) {
   mongo_data.orgNames(function (err, names) {
       res.send(names);
   }) 
});

app.post('/removeAttachment', function(req, res) {
    if (req.isAuthenticated()) {
        mongo_data.cdeById(req.body.deId, function (err, de) {
            if (err) {
                res.send("Data Element does not exist.");
            }
            var index = req.body.index;
            if (!req.user 
                  || (!req.user.orgAdmin || req.user.orgAdmin.indexOf(de.stewardOrg.name) < 0)
                    && (!req.user.orgCurator || req.user.orgCurator.indexOf(de.stewardOrg.name) < 0)
                  ) {
                res.send("You can only remove attachments you own.");
            } else {
                de.attachments.splice(index, 1);
                de.save(function (err) {
                   if (err) {
                       res.send("error: " + err);
                   } else {
                       res.send(de);
                   }
                });
            }
        });
    } else {
        res.send("You are not authorized.");                   
    }
});

app.post('/setAttachmentDefault', function(req, res) {
    if (req.isAuthenticated()) {
        mongo_data.cdeById(req.body.deId, function (err, de) {
            if (err) {
                res.send("Data Element does not exist.");
            }
            var index = req.body.index;
            if (!req.user 
                  || (!req.user.orgAdmin || req.user.orgAdmin.indexOf(de.stewardOrg.name) < 0)
                    && (!req.user.orgCurator || req.user.orgCurator.indexOf(de.stewardOrg.name) < 0)
                  ) {
                res.send("You can only remove attachments you own.");
            } else {
                var state = req.body.state;
                for (var i = 0; i < de.attachments.length; i++) {
                    de.attachments[i].isDefault = false;
                }
                de.attachments[index].isDefault = state;
                de.save(function (err) {
                   if (err) {
                       res.send("error: " + err);
                   } else {
                       res.send(de);
                   }
                });
            }
        });
    } else {
        res.send("You are not authorized.");                   
    }
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
       if (result === 404) {
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

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

