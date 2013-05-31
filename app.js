var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , cdesvc = require('./node-js/cdesvc')
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
      })
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
    mongo_data.formlist(function(err, forms) {
        res.send(forms);
    });
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

app.get('/createform', function(req, res) {
    res.render('createform', { user: req.user });
});

app.get('/formview', function(req, res) {
    res.render('formview', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user, message: req.flash('error') });
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
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

app.get('/listcontexts', function(req, res) {
    cdesvc.listcontexts(req, res);
});

app.get('/priorcdes/:id', function(req, res) {
    cdesvc.priorCdes(req, res);
});

app.get('/dataelement/:id', function(req, res) {
    cdesvc.show(req, res);
});

app.post('/dataelement', function (req, res) {
    return cdesvc.save(req, res);
});

app.get('/cdesinform/:formId', function (req, res) {
    mongo_data.formById(req.body.formId, function(err, form) {
      if (!form) {
          res.send("The requested form does not exist.");
      } else {
          var idList = [];
          for (var i in form.questions) {
              idList.push(form.questions[i].cde_uuid);
          }
          mongo_data.cdesByIdList(idList, function(err, cdes) {
             res.send(cdes); 
          });
      }
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

app.get('/autocomplete/:inValue', function(req, res) {
    return cdesvc.autocomplete(req, res);
});


//// Get VSAC TGT.
//var vsac = require('./node-js/vsac-io');
//vsac.getTGT(function(tgt) {
//});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
