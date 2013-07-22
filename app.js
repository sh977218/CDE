var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , cdesvc = require('./node-js/cdesvc')
  , usersvc = require('./node-js/usersvc')
  , contextsvc = require('./node-js/contextsvc')
  , flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , mongo_data = require('./node-js/mongo-data')
  , util = require('util')
  ;

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
    console.log("user: " + user.username + " " + user.contextAdmin);  
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
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      });
    });
  }
));

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({ secret: 'omgnodeworks' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

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

app.get('/myContextsAdmins', function(req, res) {
    usersvc.myContextsAdmins(req, res);
});


app.get('/contextAdmins', function(req, res) {
    usersvc.contextAdmins(req, res);
});

app.post('/addContextAdmin', function(req, res) {
    usersvc.addContextAdmin(req, res);
});

app.post('/removeContextAdmin', function(req, res) {
    usersvc.removeContextAdmin(req, res);
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

app.get('/contextaccountmanagement', function(req, res) {
    res.render('contextaccountmanagement');
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
    mongo_data.cdesforapproval(req.user.contextAdmin, function(err, cdes) {
        res.send(cdes);
    });
});

app.get('/siteadmins', function(req, res) {
    mongo_data.siteadmins(function(err, users) {
        res.send(users);
    });
});

app.get('/listcontexts', function(req, res) {
    cdesvc.listcontexts(req, res);
});

app.get('/managedContexts', function(req, res) {
    contextsvc.managedContexts(req, res);
});

app.post('/addContext', function(req, res) {
    contextsvc.addContext(req, res);
});

app.post('/removeContext', function(req, res) {
    contextsvc.removeContext(req, res);
});

app.post('/addComment', function(req, res) {
    if (req.isAuthenticated()) {
        mongo_data.addComment(req.body.deId, req.body.comment, req.user._id, function (err) {
            if (err) {
                res.send(err);
                return;
            }
            res.send("Comment Added");
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

// @TODO
// SECURITY LAMENESS HERE
// Check the following:
// 1. You are context owner
// 2. If you are not nlm admin, remove workflow status from json obj so you can't update it.
app.post('/dataelement', function (req, res) {
    if (req.isAuthenticated()) {
        return cdesvc.save(req, res);
    } else {
        res.send("You are not authorized to do this.");
    }
});

app.get('/cdesinform/:formId', function (req, res) {
    mongo_data.formById(req.params.formId, function(err, form) {
      if (!form) {
          res.send("The requested form does not exist.");
      } else {
          var idList = [];
          if (form.modules) {
            for (var j=0; j < form.modules.length; j++) {
              for (var i=0; i < form.modules[j].questions.length; i++) {
                  if (form.modules[j].questions[i].dataElement.de_uuid) {
                      idList.push(form.modules[j].questions[i].dataElement.de_uuid);
                  }
              }
            }
          }
          mongo_data.cdesByUuidList(idList, function(err, cdes) {
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
          if (!req.user || !req.user.contextAdmin || req.user.contextAdmin.indexOf(form.owningContext) < 0) {
            res.send("You are not authorized to do this.");           
          } else {
            mongo_data.cdeById(req.body.cdeId, function(err, cde) {
                if (!cde) {
                    res.send("The requested CDE does not exist.");
                } else {
                    var question = {
                        value: ''
                        , instructions: ''
                        , cde_uuid: cde.uuid
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

app.get('/autocomplete', function(req, res) {
    return cdesvc.name_autocomplete(req, res);
});

app.get('/autocomplete/form', function(req, res) {
    return cdesvc.name_autocomplete_form(req, res);
});

app.get('/cdediff/:deId', function(req, res) {
   return cdesvc.diff(req, res); 
});

//// Get VSAC TGT.
//var vsac = require('./node-js/vsac-io');
//vsac.getTGT(function(tgt) {
//});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
