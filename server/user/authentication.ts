import { errorLogger } from 'server/system/logging';
import { config } from 'server/system/parseConfig';
import { User } from 'shared/models.model';
import * as express from 'express';
import { addUser, updateUserAccessToken, updateUserIps, userById, userByName } from 'server/user/userDb';
import { handleError } from 'server/errorHandler/errorHandler';

const https = require('https');
const xml2js = require('xml2js');
const request = require('request');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

export type AuthenticatedRequest = {
    user: User,
    username: string,
} & express.Request;


const ticketValidationOptions = {
    host: config.uts.ticketValidation.host
    , hostname: config.uts.ticketValidation.host
    , port: config.uts.ticketValidation.port
    , path: config.uts.ticketValidation.path
    , method: 'GET'
    , agent: false
    , requestCert: true
    , rejectUnauthorized: false
};

const parser = new xml2js.Parser();

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(userById);

export function init(app) {
    app.use(passport.initialize());
    app.use(passport.session());
}

export function ticketValidate(tkt, cb) {
    ticketValidationOptions.path = config.uts.ticketValidation.path + '?service=' + config.uts.service + '&ticket=' + tkt;
    const req = https.request(ticketValidationOptions, res => {
        let output = '';
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
            output += chunk;
        });

        res.on('end', () => {
            // Parse xml result from ticket validation
            parser.parseString(output, (err, jsonResult) => {
                if (err) {
                    return cb('ticketValidate: ' + err);
                } else if (jsonResult['cas:serviceResponse'] &&
                    jsonResult['cas:serviceResponse']['cas:authenticationFailure']) {
                    // This statement gets the error message
                    return cb(jsonResult['cas:serviceResponse']['cas:authenticationFailure'][0].$.code);
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
        errorLogger.error('getTgt: ERROR with request: ' + e, {stack: new Error().stack});
        return cb(e);
    });

    req.on('timeout', () => {
        req.abort();
        return cb('ticketValidate: Request timeout. Abort if not done!');
    });

    req.end();
}

export function updateUserAfterLogin(user, ip, cb) {
    if (user.knownIPs.length > 100) {
        user.knownIPs.pop();
    }
    if (ip) {
        if (user.knownIPs.indexOf(ip) < 0) {
            user.knownIPs.unshift(ip);
        }
    }

    if (user._id) {
        updateUserIps(user._id, user.knownIPs, cb);
    }

}

export function umlsAuth(user, password, cb) {
    request.post(
        config.umls.wsHost + '/restful/isValidUMLSUser',
        {
            form: {
                licenseCode: config.umls.licenseCode
                , user
                , password
            }
        }, (error, response, body) => {
            cb(!error && response.statusCode === 200 ? body : undefined);
        }
    );
}

export function authBeforeVsac(req, username, password, done) {
    // Allows other items on the event queue to complete before execution, excluding IO related events.
    process.nextTick(() => {
        // Find the user by username in local datastore first and perform authentication.
        // If user is not found, authenticate with UMLS. If user is authenticated with UMLS,
        // add user to local datastore. Else, don't authenticate user and send error message.
        userByName(username, handleError({}, user => {
            // If user was not found in local datastore || an error occurred || user was found and password equals 'umls'
            if (!user || (user && user.password === 'umls')) {
                console.log('***********************************************');
                console.log(username);
                console.log(JSON.stringify(user));
                umlsAuth(username, password, result => {
                    if (result === undefined) {
                        return done(null, false, {message: 'UMLS UTS login server is not available.'});
                    } else if (result.indexOf('true') > 0) {
                        findAddUserLocally({username, ip: req.ip}, user => {
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
                    return updateUserAfterLogin(user, req.ip, done);
                }
            }
        }));
    });
}

passport.use(new localStrategy({passReqToCallback: true}, authBeforeVsac));

export function findAddUserLocally(profile, cb) {
    userByName(profile.username, handleError({}, user => {
        if (!user) { // User has been authenticated but user is not in local db, so register him.
            addUser(
                {
                    username: profile.username,
                    password: 'umls',
                    quota: 1024 * 1024 * 1024,
                    accessToken: profile.accessToken,
                    refreshToken: profile.refreshToken
                }, (err, newUser) => {
                    updateUserAfterLogin(newUser, profile.ip, (err, newUser) => cb(newUser));
                });
        } else {
            updateUserAfterLogin(user, profile.ip, () => {
                updateUserAccessToken(user._id, profile, (err, user) => {
                    cb(user);
                });
            });
        }
    }));
}

export function ticketAuth(req, res, next) {
    if (!req.query.ticket || req.query.ticket.length <= 0) {
        next();
    } else {
        ticketValidate(req.query.ticket, (err, username) => {
            if (err) {
                next();
            } else {
                findAddUserLocally({username, ip: req.ip}, user => {
                    if (user) {
                        req.user = user;
                    }
                    next();
                });
            }
        });
    }
}
