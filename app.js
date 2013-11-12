var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , cdesvc = require('./node-js/cdesvc')
  , usersvc = require('./node-js/usersvc')
  , orgsvc = require('./node-js/orgsvc')
  , flash = require('connect-flash')
  , passport = require('passport')
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
                        mongo_data.addUser({username: username, password: "umls"}, function(newUser) {
                            console.log("new user registered");
                            return done(null, newUser);
                        });
                    } else {
                        return done(null, user);
                    }
                });
            } else {
                findByUsername(username, function(err, user) {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
                    if (user.password != password) { return done(null, false, { message: 'Invalid password' }); } 
                    return done(null, user);
                })                
            }
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

app.get('/', function(req, res){
  res.render('index');
});

app.get('/list', function(req, res){
  res.render('list');
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
    res.render('orgaccountmanagement');
});

app.get('/formview', function(req, res) {
    res.render('formview', { user: req.user });
});

app.get('/deview', function(req, res) {
    res.render("deview");
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user, message: req.flash('error') });
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '#/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
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
                if (de.comments[c]._id == req.body.commentId) {
                    console.log(de.comments[c].user);
                    console.log(req.user._id);
                    if (de.comments[c].user != req.user._id) {
                        res.send("You can only remove comments you own.");
                    } else {
                        de.comments.splice(c, 1);
                        de.save(function (err) {
                           if (err) {
                               res.send("error: " + err);
                           } else {
                               res.send("Comment removed");
                           }
                        });
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

app.get('/dataelement/:uuid/:version', function(req, res) {
    mongo_data.deByUuidAndVersion(req.params.uuid, req.params.version, function(err, de) {
        res.send(de);
    });
});

// @TODO
// SECURITY LAMENESS HERE
// Check the following:
// 1. You are org owner
// 2. If you are not nlm admin, remove workflow status from json obj so you can't update it.
app.post('/dataelement', function (req, res) {
    if (req.isAuthenticated()) {
        return cdesvc.save(req, res);
    } else {
        res.send("You are not authorized to do this.");
    }
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

app.post('/linktovsac', function (req, res) {
    return cdesvc.linktovsac(req, res);
});

app.get('/autocomplete/:name', function(req, res) {
    return cdesvc.name_autocomplete(req.params.name, res);
});

app.get('/autocomplete/form', function(req, res) {
    return cdesvc.name_autocomplete_form(req, res);
});

app.get('/cdediff/:deId', function(req, res) {
   return cdesvc.diff(req, res); 
});

app.get('/classificationtree', function(req, res) {
    mongo_data.classificationTree(function(tree) {
       res.send(tree); 
    });
});

app.post('/addAttachmentsToCde', function(req, res) {
    if (req.isAuthenticated()) {
        return mongo_data.cdeById(req.body.de_id, function(err, cde) {
            if (req.user.orgCurator.indexOf(cde.stewardOrg.name) < 0 
                    && req.user.orgAdmin.indexOf(cde.stewardOrg.name) < 0 
                    && !req.user.siteAdmin) {
                res.send("not authorized");
            } else {
                if (!req.files.uploadedFiles.length) {
                    mongo_data.addCdeAttachment(req.files.uploadedFiles, req.user, "some comment", cde);
                } else {
                    for (var i = 0; i < req.files.uploadedFiles.length; i++) {
                        mongo_data.addCdeAttachment(req.files.uploadedFiles[i], req.user, "some comment", cde);
                    }
                }  
                res.send("done");     
            }
        });
    } else {
        res.send("You need to be logged in to do this");
    }
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
              console.log("not auth");
                res.send("You can only remove attachments you own.");
            } else {
                de.attachments.splice(index, 1);
                de.save(function (err) {
                   if (err) {
                       res.send("error: " + err);
                   } else {
                       res.send("Attachment removed");
                   }
                });
            }
        });
    } else {
        res.send("You are not authorized.");                   
    }
});


app.get('/data/:imgtag', function(req, res) {
  mongo_data.getFile( function(error,data) {
     res.writeHead('200', {'Content-Type': 'image/png'});
     res.end(data,'binary');
  }, res, req.params.imgtag );
});

// Get VSAC TGT.
vsac.getTGT(function(tgt) {
});

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

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
