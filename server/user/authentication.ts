import { Express, Request, RequestHandler } from 'express';
import { deserializeUser, initialize as passportInitialize, serializeUser, session as passportSession, use as passportUse} from 'passport';
import { get, post } from 'request';
import { consoleLog } from 'server/log/dbLogger';
import { errorLogger } from 'server/system/logging';
import { config } from 'server/system/parseConfig';
import { Cb1, CbErr1, CbError1, CbError2, User } from 'shared/models.model';
import { addUser, updateUserIps, userById, userByName, UserDocument } from 'server/user/userDb';
import { Parser } from 'xml2js';

const localStrategy = require('passport-local').Strategy;

export type AuthenticatedRequest = {
    user: User,
    username: string,
} & Request;

const parser = new Parser();

serializeUser((user: User, done) => {
    done(null, user._id);
});

deserializeUser(userById);

export function init(app: Express) {
    app.use(passportInitialize());
    app.use(passportSession());
}

export function ticketValidate(tkt: string, cb: CbErr1<string | void>) {
    get(config.uts.ticketValidation + '?service=' + config.uts.service + '&ticket=' + tkt, (error, response, body) => {
        /* istanbul ignore if */
        if (error) {
            errorLogger.error('getTgt: ERROR with request: ' + error, {stack: new Error().stack});
            return cb(error);
        }
        // Parse xml result from ticket validation
        parser.parseString(body, (err?: Error, jsonResult?: any) => {
            /* istanbul ignore if */
            if (err) {
                return cb('ticketValidate: ' + err);
            }
            if (jsonResult['cas:serviceResponse'] &&
                jsonResult['cas:serviceResponse']['cas:authenticationFailure']) {
                // This statement gets the error message
                return cb(jsonResult['cas:serviceResponse']['cas:authenticationFailure'][0].$.code);
            }
            /* istanbul ignore else */
            if (jsonResult['cas:serviceResponse']['cas:authenticationSuccess'] &&
                jsonResult['cas:serviceResponse']['cas:authenticationSuccess']) {
                // Returns the username
                return cb(undefined, jsonResult['cas:serviceResponse']['cas:authenticationSuccess'][0]['cas:user'][0]);
            }

            return cb('ticketValidate: invalid XML response!');
        });
    });
}

export function updateUserAfterLogin(user: UserDocument, ip: string, cb: CbError1<UserDocument | null>) {
    if (user.knownIPs.length > 100) {
        user.knownIPs.pop();
    }
    if (user.knownIPs.indexOf(ip) < 0) {
        user.knownIPs.unshift(ip);
    }

    updateUserIps(user._id, user.knownIPs, cb);
}

export function umlsAuth(username: string, password: string, cb: Cb1<any>) {
    post(
        config.umls.wsHost + '/restful/isValidUMLSUser',
        {
            form: {
                licenseCode: config.umls.licenseCode,
                user: username,
                password,
            }
        }, (error, response, body) => {
            cb(!error && response.statusCode === 200 ? body : undefined);
        }
    );
}

export function authBeforeVsac(req: Request, username: string, password: string,
                               done: CbError2<UserDocument | null | void, {message: string} | void>) {
    // Allows other items on the event queue to complete before execution, excluding IO related events.
    process.nextTick(() => {
        /* istanbul ignore if */
        if (req.body.federated !== true) {
            throw new Error('local authentication unimplemented');
            // // Find the user by username in local datastore first and perform authentication.
            // // If user is not found, authenticate with UMLS. If user is authenticated with UMLS,
            // // add user to local datastore. Else, don't authenticate user and send error message.
            // userByName(username, (err, user) => {
            //     // If user was not found in local datastore || an error occurred || user was found and password equals 'umls'
            //     if (err || !user || (user && user.password === 'umls')) {
            //         umlsAuth(username, password, result => {
            //             if (result === undefined) {
            //                 done(null, null, {message: 'UMLS UTS login server is not available.'});
            //             } else if (result.indexOf('true') > 0) {
            //                 findAddUserLocally({username, ip: req.ip}, (err, user) => done(err, user));
            //             } else {
            //                 done(null, null, {message: 'Incorrect username or password'});
            //             }
            //         });
            //     } else { // If user was found in local datastore and password != 'umls'
            //         if (user.lockCounter === 300) {
            //             done(null, null, {message: 'User is locked out'});
            //         } else if (user.password !== password) {
            //             // Initialize the lockCounter if it hasn't been
            //             (user.lockCounter >= 0 ? user.lockCounter += 1 : user.lockCounter = 1);
            //
            //             user.save(() => done(null, null, {message: 'Incorrect username or password'}));
            //         } else {
            //             // Update user info in datastore
            //             updateUserAfterLogin(user, req.ip, (err, user) => done(err, user));
            //         }
            //     }
            // });
        }
        get(`${config.uts.federatedServiceValidate}?service=${config.publicUrl}/loginFederated&ticket=${req.body.ticket}`,
            (error, response, body) => {
                try {
                    body = JSON.parse(body);
                    username = body.utsUser.username;
                } catch (e) {
                    done(new Error('UMLS authentication failed'));
                }
                /* istanbul ignore else */
                if (username) {
                    findAddUserLocally({username, ip: req.ip}, (err, user) => done(err, user));
                } else {
                    done(new Error('No UMLS User'));
                }
            }
        );
    });
}

passportUse(new localStrategy({passReqToCallback: true}, authBeforeVsac));

export interface UserAddProfile {
    username: string;
    ip: string;
    accessToken?: string;
    refreshToken?: string;
}

export function findAddUserLocally(profile: UserAddProfile, cb: CbError1<UserDocument | null | void>) {
    userByName(profile.username, (err, user) => {
        /* istanbul ignore if */
        if (err) {
            cb(err);
            return;
        }
        if (!user) { // User has been authenticated but user is not in local db, so register him.
            addUser(
                {
                    username: profile.username,
                    password: 'umls',
                    quota: 1024 * 1024 * 1024,
                    accessToken: profile.accessToken,
                    refreshToken: profile.refreshToken,
                    orgAdmin: [],
                    orgCurator: [],
                    commentNotifications: [],
                    lastLogin: 0,
                    lockCounter: 0,
                    knownIPs: [],
                },
                (err, user) => {
                    /* istanbul ignore if */
                    if (err || !user) {
                        cb(new Error('save not successful'));
                        return;
                    }
                    updateUserAfterLogin(user, profile.ip, (err, newUser) => cb(null, newUser));
                }
            );
        } else {
            updateUserAfterLogin(user, profile.ip, (err, newUser) => cb(null, newUser));
        }
    });
}

export const ticketAuth: RequestHandler = (req, res, next) => {
    if (!req.query.ticket || req.query.ticket.length <= 0 || req.url.startsWith('/loginFederated?ticket=')) {
        next();
        return;
    }
    ticketValidate(req.query.ticket, (err, username) => {
        if (err || !username) {
            next(); // drop error
            return;
        }
        findAddUserLocally({username, ip: req.ip}, (err, user) => {
            if (user) {
                req.user = user;
            }
            next(err);
        });
    });
};
