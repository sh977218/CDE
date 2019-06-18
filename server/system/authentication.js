var https = require('https')
    , xml2js = require('xml2js')
    , helper = require('./helper.js')
    , logging = require('./logging.js')
    , config = require('./parseConfig')
    , mongo_data_system = require('./mongo-data')
    , request = require('request')
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , util = require('util')
    ;

var ticketValidationOptions = {
    host: config.uts.ticketValidation.host
    , hostname: config.uts.ticketValidation.host
    , port: config.uts.ticketValidation.port
    , path: config.uts.ticketValidation.path
    , method: 'GET'
    , agent: false
    , requestCert: true
    , rejectUnauthorized: false

};

var parser = new xml2js.Parser();
var auth = this;

passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    mongo_data_system.userById(id, function (err, user) {
        done(err, user);
    });
});

exports.init = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());
};

exports.ticketValidate = function (tkt, cb) {
    ticketValidationOptions.path = config.uts.ticketValidation.path + '?service=' + config.uts.service + '&ticket=' + tkt;
    var req = https.request(ticketValidationOptions, function (res) {
        var output = '';
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function () {
            // Parse xml result from ticket validation
            parser.parseString(output, function (err, jsonResult) {
                if (err) {
                    return cb('ticketValidate: ' + err);
                } else if (jsonResult['cas:serviceResponse'] &&
                    jsonResult['cas:serviceResponse']['cas:authenticationFailure']) {
                    // This statement gets the error message
                    return cb(jsonResult['cas:serviceResponse']['cas:authenticationFailure'][0]['$']['code']);
                } else if (jsonResult['cas:serviceResponse']['cas:authenticationSuccess'] &&
                    jsonResult['cas:serviceResponse']['cas:authenticationSuccess']) {
                    // Returns the username
                    return cb(null, jsonResult['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:user'][0]);
                }

                return cb('ticketValidate: invalid XML response!');
            });

        });
    });

    req.on('error', e => {
        logging.errorLogger.error('getTgt: ERROR with request: ' + e, {stack: new Error().stack});
        return cb(e);
    });

    req.on("timeout", function () {
        req.abort();
        return cb('ticketValidate: Request timeout. Abort if not done!');
    });

    req.end();
};

exports.updateUserAfterLogin = function (user, ip, cb) {
    if (!user.knownIPs) {
        user.knownIPs = [];
    }
    if (user.knownIPs.length > 100) {
        user.knownIPs.pop();
    }
    if (ip) {
        if (user.knownIPs.indexOf(ip) < 0) {
            user.knownIPs.unshift(ip);
        }
    }

    if (user._id) {
        mongo_data_system.User.findByIdAndUpdate(user._id, {lockCounter: 0, lastLogin: Date.now(), knownIPs: user.knownIPs}, cb);
    }

};

exports.umlsAuth = function (user, password, cb) {
    request.post(
        config.umls.wsHost + '/restful/isValidUMLSUser',
        {
            form: {
                licenseCode: config.umls.licenseCode
                , user: user
                , password: password
            }
        }, function (error, response, body) {
            cb(!error && response.statusCode == 200 ? body : undefined);
        }
    );
};

exports.authBeforeVsac = function (req, username, password, done) {
    // Allows other items on the event queue to complete before execution, excluding IO related events.
    process.nextTick(function () {
        // Find the user by username in local datastore first and perform authentication.
        // If user is not found, authenticate with UMLS. If user is authenticated with UMLS,
        // add user to local datastore. Else, don't authenticate user and send error message.
        mongo_data_system.userByName(username, (err, user) => {
            // If user was not found in local datastore || an error occurred || user was found and password equals 'umls'
            if (err || !user || (user && user.password === 'umls')) {
                exports.umlsAuth(username, password, result => {
                    if (result === undefined) {
                        return done(null, false, {message: 'UMLS UTS login server is not available.'});
                    } else if (result.indexOf("true") > 0) {
                        auth.findAddUserLocally({username: username, ip: req.ip}, user => {
                            return done(null, user);
                        });
                    } else {
                        return done(null, false, {message: 'Incorrect username or password'});
                    }
                });
            } else { // If user was found in local datastore and password != 'umls'
                if (user.lockCounter === 300) {
                    return done(null, false, {message: 'User is locked out'});
                } else if (user.password !== password) {
                    // Initialize the lockCounter if it hasn't been
                    (user.lockCounter >= 0 ? user.lockCounter += 1 : user.lockCounter = 1);

                    return user.save(() => {
                        return done(null, false, {message: 'Incorrect username or password'});
                    });
                } else {
                    // Update user info in datastore
                    return auth.updateUserAfterLogin(user, req.ip, done);
                }
            }
        });
    });
};

passport.use(new LocalStrategy({passReqToCallback: true}, this.authBeforeVsac));

exports.findAddUserLocally = function (profile, cb) {
    mongo_data_system.userByName(profile.username, function (err, user) {
        if (err) {
            cb(err);
        } else if (!user) { // User has been authenticated but user is not in local db, so register him.
            mongo_data_system.addUser(
                {
                    username: profile.username,
                    password: "umls",
                    quota: 1024 * 1024 * 1024,
                    accessToken: profile.accessToken,
                    refreshToken: profile.refreshToken
                },  (err, newUser) => {
                    auth.updateUserAfterLogin(newUser, profile.ip, (err, newUser) => cb(newUser));
                });
        } else {
            auth.updateUserAfterLogin(user, profile.ip, () => {
                mongo_data_system.User.findByIdAndUpdate(user._id,
                    {accessToken: profile.accessToken, refreshToken: profile.refreshToken}, (err, user) => cb(user));
            });
        }
    });
};

exports.ticketAuth = function (req, res, next) {
    if (!req.query.ticket || req.query.ticket.length <= 0) {
        next();
    } else auth.ticketValidate(req.query.ticket, function (err, username) {
        if (err) {
            next();
        } else {
            auth.findAddUserLocally({username: username, ip: req.ip}, function (user) {
                if (user) req.user = user;
                next();
            });
        }
    });
};