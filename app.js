var path = require('path');

require(path.join(__dirname, './deploy/configTest.js'));

var express = require('express')
  , http = require('http')
  , flash = require('connect-flash')
  , passport = require('passport')
  , crypto = require('crypto')
  , LocalStrategy = require('passport-local').Strategy
  //, mongo_data_cde = require('./modules/cde/node-js/mongo-data') //TODO: Remove this dependency!
  , mongo_data_system = require('./modules/system/node-js/mongo-data')
  , config = require('config')
  , MongoStore = require('./modules/cde/node-js/assets/connect-mongo.js')(express)//TODO: Remove this dependency!
  , dbLogger = require('./modules/cde/node-js/dbLogger.js')//TODO: Remove this dependency!
  , favicon = require('serve-favicon')
  , auth = require( './modules/cde/node-js/authentication' )//TODO: Remove this dependency!
  , logging = require('./modules/cde/node-js/logging.js')//TODO: Remove this dependency!
  , orgsvc = require('./modules/system/node-js/orgsvc')//TODO: Remove this dependency!
  , usersrvc = require('./modules/system/node-js/usersrvc')//TODO: Remove this dependency!
;

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    mongo_data_system.userById(id, function(err, user){
        console.log("user: " + user.username + " " + user.orgAdmin);  
        done(err, user);
    });
});

passport.use(new LocalStrategy({passReqToCallback: true}, auth.authAfterVsac));
var app = express();

app.use(auth.ticketAuth);

process.on('uncaughtException', function (err) {
  logging.processLogger.error('Caught exception: ' + err.stack);
});

var winstonStream = {
    write: function(message, encoding){
        logging.expressLogger.info(message);
    }
};

// all environments
app.set('port', config.port || 3000);
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, './modules/cde/public/assets/img/favicon.ico')));//TODO: Remove this dependency!

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));

var sessionStore = new MongoStore({
    mongoose_connection: mongo_data_system.mongoose_connection  
});
app.use(function(req, res, next) {
    this.isFile = function(req) {
        if (req.originalUrl.substr(req.originalUrl.length-3,3) === ".js") return true;
        if (req.originalUrl.substr(req.originalUrl.length-4,4) === ".css") return true;
        if (req.originalUrl.substr(req.originalUrl.length-4,4) === ".gif") return true;
        return false;
    };
    if ((req.cookies['connect.sid'] || req.originalUrl === "/login") && !this.isFile(req)) {
        var initExpressSession = express.session({ secret: "omgnodeworks", proxy: true, store:sessionStore });
        initExpressSession(req, res, next);
   } else {
       next();
   }
});

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

var logFormat = {remoteAddr: ":remote-addr", url: ":url", method: ":method", httpStatus: ":status", date: ":date", referrer: ":referrer"};

app.use(express.logger({format: JSON.stringify(logFormat), stream: winstonStream}));

app.use(app.router);
//app.use(express.static(path.join(__dirname, '../public')));
//app.use("/shared", express.static(path.join(__dirname, '../shared')));

app.use(function(err, req, res, next){
  logging.expressErrorLogger.error(JSON.stringify({msg: err.stack}));
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

app.get('/listOrgs', function(req, res) {
    mongo_data_system.listOrgs(function(err, orgs) {
       if (err) {
           res.send("ERROR");
       } else {
           res.send(orgs);
       }   
    });        
});

app.get('/listOrgsLongName', function(req, res) {
    mongo_data_system.listOrgsLongName(function(err, orgs) {
       if (err) {
           logging.expressErrorLogger.error(JSON.stringify({msg: err.stack}));
           res.send("ERROR");
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
  req.session.destroy(function (err) {
      req.logout();
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


app.get('/org/:name', function(req, res) {
   return mongo_data_system.orgByName(req.params.name, function (result) {
       res.send(result);
   });
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
        res.render('siteAudit');
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

var cdeModule = require(path.join(__dirname, './modules/cde/node-js/app.js'));
cdeModule.init(app);
http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});