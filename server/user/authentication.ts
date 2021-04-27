import { Express, Request, RequestHandler } from 'express'
import fetch from 'node-fetch';
import {
    deserializeUser, initialize as passportInitialize, serializeUser, session as passportSession, use as passportUse
} from 'passport';
import { errorLogger } from 'server/system/logging';
import { config } from 'server/system/parseConfig';
import { Cb1, CbErr1, CbError2, CbNode, User } from 'shared/models.model';
import { addUser, updateUserIps, userById, userByName, UserDocument } from 'server/user/userDb';
import { isStatus, json, text } from 'shared/fetch';
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
    fetch(config.uts.ticketValidation + '?service=' + config.uts.service + '&ticket=' + tkt)
        .then(isStatus([200]))
        .then(text)
        .then((body) => {
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
        }, err => {
            errorLogger.error('getTgt: ERROR with request: ' + err, {stack: new Error().stack});
            return cb(err);
        });
}

export function updateUserAfterLogin(user: UserDocument, ip: string, cb: CbNode<UserDocument>) {
    if (user.knownIPs.length > 100) {
        user.knownIPs.pop();
    }
    if (user.knownIPs.indexOf(ip) < 0) {
        user.knownIPs.unshift(ip);
    }

    updateUserIps(user._id, user.knownIPs, cb);
}

export function authBeforeVsac(req: Request, username: string, password: string,
                               done: CbError2<UserDocument | null | void, { message: string } | void>) {
    // Allows other items on the event queue to complete before execution, excluding IO related events.
    process.nextTick(() => {
        /* istanbul ignore if */
        if (req.body.federated !== true) {
            throw new Error('local authentication unimplemented');
        }
        let service = config.publicUrl;
        if (req.body.green) {
            service = config.greenPublicUrl;
        }
        fetch(`${config.uts.federatedServiceValidate}?service=${service}/loginFederated&ticket=${req.body.ticket}`)
            .then(isStatus([200]))
            .then(json)
            .then((body) => {
                let domain: string = '';
                try {
                    username = body.utsUser.username;
                    domain = body.idpUserOrg
                } catch (e) {
                    done(new Error('UMLS authentication failed'));
                }
                /* istanbul ignore else */
                if (username) {
                    findAddUserLocally({username, ip: req.ip, domain}, (err, user) => done(err, user));
                } else {
                    done(new Error('No UMLS User'));
                }
            });
    });
}

passportUse(new localStrategy({passReqToCallback: true}, authBeforeVsac));

export interface UserAddProfile {
    domain?: string
    username: string;
    ip: string;
    accessToken?: string;
    refreshToken?: string;
}

export function findAddUserLocally(profile: UserAddProfile, cb: CbNode<UserDocument>) {
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
