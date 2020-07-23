import * as express from 'express';
import { Express } from 'express';
import { errorLogger } from 'server/system/logging';
import { config } from 'server/system/parseConfig';
import { User } from 'shared/models.model';
import { addUser, updateUserIps, userById, userByName } from 'server/user/userDb';

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

export function init(app: Express) {
    app.use(passport.initialize());
    app.use(passport.session());
}

export function ticketValidate(tkt, cb) {
    const host = 'https://' + ticketValidationOptions.host;
    const port = ':' + ticketValidationOptions.port;
    const path = config.uts.ticketValidation.path;
    const param = '?service=' + config.uts.service + '&ticket=' + tkt;
    const uri = host + port + path + param;
    request.get(uri, (error, response, body) => {
        if (error) {
            errorLogger.error('getTgt: ERROR with request: ' + error, {stack: new Error().stack});
            return cb(error);
        } else {
            // Parse xml result from ticket validation
            parser.parseString(body, (err, jsonResult) => {
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
        }
    });
}

export function updateUserAfterLogin(user, ip, cb) {
    if (user.knownIPs.length > 100) {
        user.knownIPs.pop();
    }
    if (user.knownIPs.indexOf(ip) < 0) {
        user.knownIPs.unshift(ip);
    }

    updateUserIps(user._id, user.knownIPs, cb);
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
        // are we doing federated?
        if (req.body.federated === true) {
            request.get(`${config.uts.federatedServiceValidate}?service=${config.publicUrl}/login/federated&ticket=${req.body.ticket}`,
                (error, response, body) => {
                    try {
                        body = JSON.parse(body);
                    } catch (e) {
                        done('Unknown error');
                    }
                    username = body.utsUser.username;
                    if (username) {
                        findAddUserLocally({username, ip: req.ip}, user => done(null, user));
                    } else {
                        done('No UMLS User');
                    }
            });
        } else {
            // Find the user by username in local datastore first and perform authentication.
            // If user is not found, authenticate with UMLS. If user is authenticated with UMLS,
            // add user to local datastore. Else, don't authenticate user and send error message.
            userByName(username, (err, user) => {
                // If user was not found in local datastore || an error occurred || user was found and password equals 'umls'
                if (err || !user || (user && user.password === 'umls')) {
                    umlsAuth(username, password, result => {
                        if (result === undefined) {
                            return done(null, false, {message: 'UMLS UTS login server is not available.'});
                        } else if (result.indexOf('true') > 0) {
                            findAddUserLocally({username, ip: req.ip}, user => done(null, user));
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
            });
        }
    });
}

passport.use(new localStrategy({passReqToCallback: true}, authBeforeVsac));

export function findAddUserLocally(profile, cb) {
    userByName(profile.username, (err, user) => {
        if (err) {
            cb(err);
        } else if (!user) { // User has been authenticated but user is not in local db, so register him.
            addUser(
                {
                    username: profile.username,
                    password: 'umls',
                    quota: 1024 * 1024 * 1024,
                    accessToken: profile.accessToken,
                    refreshToken: profile.refreshToken
                }, (err, user) => {
                    updateUserAfterLogin(user, profile.ip, (err, newUser) => cb(newUser));
                });
        } else {
            updateUserAfterLogin(user, profile.ip, (err, newUser) => cb(newUser));
        }
    });
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
