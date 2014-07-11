var https = require('https')
  , xml2js = require('xml2js')
  , helper = require('./helper.js')
  , logging = require('./logging.js')
  , config = require('config')
  , mongo_data = require('./mongo-data') 
  , vsac = require('./vsac-io')
;

var ticketValidationOptions = {
    host: config.uts.ticketValidation.host
    , hostname: config.uts.ticketValidation.host
    , port: config.uts.ticketValidation.port
    , path: config.uts.ticketValidation.path
    , method: 'POST'
    , agent: false
    , requestCert: true
    , rejectUnauthorized: false

};

var parser = new xml2js.Parser();

function findByUsername(username, fn) {
    return mongo_data.userByName(username, function(err, user) {
        return fn(null, user);
    });
};

/**
 * Checks the validity of a ticket via a POST API call to validation server.
 * 
 * @param tkt - ticket to valadate
 * @returns 
 */
exports.ticketValidate = function( tkt, cb ) {
    ticketValidationOptions.path = config.uts.ticketValidation.path + '?service=' + config.uts.service + '&ticket=' + tkt;
    var req = https.request(ticketValidationOptions, function(res) {
        var output = '';
        res.setEncoding('utf8');
        
        res.on('data', function (chunk) {
            output += chunk;
        });
        
        res.on('end', function() {
            // Parse xml result from ticket validation
            parser.parseString( output, function( err, jsonResult ) {
                if( err ) {
                    return cb( 'ticketValidate: ' + err );
                } else if( jsonResult['cas:serviceResponse'] && 
                           jsonResult['cas:serviceResponse']['cas:authenticationFailure'] ) {
                    // This statement gets the error message
                    //jsonResult['cas:serviceResponse']['cas:authenticationFailure'][0]['_'];
                    return cb( jsonResult['cas:serviceResponse']['cas:authenticationFailure'][0]['$']['code'] );
                } else if( jsonResult['cas:serviceResponse']['cas:authenticationSuccess'] &&
                           jsonResult['cas:serviceResponse']['cas:authenticationSuccess'] ) {
                    // Returns the username
                    return cb( null, jsonResult['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:user'][0] );
                }
                
                return cb( 'ticketValidate: invalid XML response!' );
            });
            
        });
    });
    
    req.on('error', function (e) {
        logging.expressErrorLogger.error('getTgt: ERROR with request: ' + e);
    });
    
    req.on("timeout", function() { 
        req.abort();
        return cb( 'ticketValidate: Request timeout. Abort if not done!' );
    });
    
    // Emit timeout event if no response within GLOBALS.REQ_TIMEOUT seconds
    setTimeout(function() {
        req.emit("timeout");
    }, helper.GLOBALS.REQ_TIMEOUT);

    req.end();
};

exports.updateUser = function(req, user) {
    if( !user.knowIPs ) {
        user.knownIPs = [];
    }
    if( user.knownIPs.length > 100 ) {
        user.knownIPs.pop();
    }
    if( user.knownIPs.indexOf(req.ip) < 0 ) {
        user.knownIPs.unshift(req.ip);
    }
};
var auth = this;
exports.authAfterVsac =   function(req, username, password, done) {
    
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
                        user.lockCounter = 0;
                        user.lastLogin = Date.now();                        
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
                    auth.updateUser(req, user);
                    return mongo_data.save(user, function(err, user) {
                        return done(null, user);                    
                    });
                });                
            };
        });
    });
  };