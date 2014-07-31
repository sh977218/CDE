var https = require('https')
  , xml2js = require('xml2js')
  , helper = require('./helper.js') 
  , logging = require('./logging.js') 
  , config = require('config')
  , mongo_data_system = require('./mongo-data') 
  , request = require('request')
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
var auth = this;
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

exports.updateUserAfterLogin = function(req, user) {
    if( !user.knowIPs ) {
        user.knownIPs = [];
    }
    if( user.knownIPs.length > 100 ) {
        user.knownIPs.pop();
    }
    if( user.knownIPs.indexOf(req.ip) < 0 ) {
        user.knownIPs.unshift(req.ip);
    }
    
    user.lockCounter = 0;
    user.lastLogin = Date.now();
};

exports.umlsAuth = function(user, password, cb) {
    request.post(
        'https://uts-ws.nlm.nih.gov/restful/isValidUMLSUser',
        { form: {
        licenseCode:  config.umls.licenseCode
        , user: user
        , password: password
        }}, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                cb(body);
            }
        }
    );
};

exports.authBeforeVsac = function(req, username, password, done) {
    
    // Allows other items on the event queue to complete before execution, excluding IO related events.
    process.nextTick(function () {
        // Find the user by username in local datastore first and perform authentication.
        // If user is not found, authenticate with UMLS. If user is authenticated with UMLS,
        // add user to local datastore. Else, don't authenticate user and send error message.
        mongo_data_system.userByName(username, function(err, user) {
            // If user was not found in local datastore || an error occurred || user was found and password equals 'umls'
            if (err || !user || (user && user.password==='umls') ) {
                exports.umlsAuth(username, password, function(result) {                                                                                                                                                                                                                 
                    if (result.indexOf("true") > 0) {
                        auth.findAddUserLocally(username, req, function(user) {
                            return done(null, user);
                        });
                    } else {
                        return done(null, false, { message: 'Incorrect username or password' });
                    }
                });
            } else { // If user was found in local datastore and password != 'umls'
                if (user.lockCounter === 3) {
                    return done(null, false, { message: 'User is locked out' }); 
                } else if (user.password !== password) {
                    // Initialize the lockCounter if it hasn't been
                    (user.lockCounter>=0? user.lockCounter += 1 : user.lockCounter = 1);
                    
                    return user.save(function(err, user) {
                        return done(null, false, { message: 'Incorrect password' }); 
                    });
                } else {
                    // Update user info in datastore
                    auth.updateUserAfterLogin(req, user);
                    return user.save(function(err, user) {
                        return done(null, user);                    
                    });
                }
            }
        });  
    });
};
  
exports.findAddUserLocally = function(username, req, next) {
    mongo_data_system.userByName(username, function(err, user) {
        if( err ) { // note: findByUsername always returns error=null
            next(); 
            return;
        } else if(!user) { // User has been authenticated but user is not in local db, so register him.
            mongo_data_system.addUser({username: username, password: "umls", quota: 1024 * 1024 * 1024}, function(newUser) {
                next(newUser);
            });
        } else { // User already exists, so update user info. Code should never reach here if using authBeforeVsac()
            auth.updateUserAfterLogin(req, user);
            return user.save(function(err, user) {
                next(user);
            });
        }
    });      
};

exports.ticketAuth = function(req, res, next){
    // Check for presence of url param 'ticket'
    if(!req.query.ticket || req.query.ticket.length<=0) {
        next();
    }    
    else auth.ticketValidate(req.query.ticket, function(err, username) {
        if(err) {
            next(); 
            return; 
        }
        auth.findAddUserLocally(username, req, function(user) {
            if (user) req.user = user;
            next();
        });
    });    
};