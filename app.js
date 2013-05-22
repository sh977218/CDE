
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , cdesvc = require('./node-js/cdesvc')
  , flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;


///// AUTH
var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com'}
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com'}
  , { id: 3, username: 'cabig', password: 'cabig', email: 'joe@example.com', contextAdmin: ['caBIG']}
  , { id: 4, username: 'fitbir', password: 'fitbir', email: 'joe@example.com', contextAdmin: ['FITBIR']}
  , { id: 5, username: 'ludet', password: 'ludet', email: 'joe@example.com', contextAdmin: ['caBIG', 'CTEP', 'FITBIR']}
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
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
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
};

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/list', function(req, res){
  res.render('list', { user: req.user });
});


app.get('/inlineTextArea', function(req, res){
  res.render('inlineTextArea', { user: req.user });
});

app.get('/inlineText', function(req, res){
  res.render('inlineText', { user: req.user });
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

app.post('/linktovsac', function (req, res) {
    return cdesvc.linktovsac(req, res);
});

app.get('/autocomplete/:inValue', function(req, res) {
    return cdesvc.autocomplete(req, res);
});

//// Get VSAC TGT.
var vsac = require('./node-js/vsac-io');
vsac.getTGT(function(tgt) {
//    console.log("TGT: " + tgt);
//    vsac.getValueSet('2.16.840.1.113883.3.464.1003.106.11.1001', function(result) {
//        console.log("Got a Value Set: ");
//        console.log(result);
//    });
});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
