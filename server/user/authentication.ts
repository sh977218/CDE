import { Express, Request, RequestHandler } from 'express'
import fetch from 'node-fetch';
import { Strategy as CustomStrategy } from 'passport-custom';
import { Strategy as LocalStrategy } from 'passport-local';
import { config } from 'server';
import { logError } from 'server/log/dbLogger';
import { errorLogger } from 'server/system/logging';
import { CbErr1, CbError1, CbNode, User } from 'shared/models.model';
import { addUser, updateUserIps, userById, userByName, UserDocument } from 'server/user/userDb';
import { isStatus, json } from 'shared/fetch';

const passport = require('passport'); // must use require to preserve this pointer

export type AuthenticatedRequest = {
    user: User,
    username: string,
} & Request;

const dummyUser = Object.freeze({}); // soft authenticated, read permission only, no permissions from a real user

passport.serializeUser((user: User, done: CbError1) => {
    done(null, user._id);
});

passport.deserializeUser(userById);

export function init(app: Express) {
    app.use(passport.initialize());
    app.use(passport.session());
}

export function umlsApiKeyValidate(apiKey: string, cb: CbErr1<string | void>) {
    if (!config.uts.apiKeyValidation) {
        logError({
            message: 'Configuration Error: uts.apiKeyValidation is missing',
            origin: 'umlsApiKeyValidate',
        });
        return cb('Configuration Error: uts.apiKeyValidation is missing');
    }
    fetch(config.uts.apiKeyValidation + apiKey)
        .then(isStatus([200]))
        .then<{valid: false} | {valid: true, username: string}>(json)
        .then((body) => {
            return body.valid
                ? cb(undefined, body.username)
                : cb(undefined);
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
                               done: (error: Error | null, user?: UserDocument | null, options?: { message: string }) => void) {
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
            .then<any>(json)
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
                    findAddUserLocally({username, ip: req.ip, domain}, (err, user) => done(err, user || null));
                } else {
                    done(new Error('No UMLS User'));
                }
            });
    });
}

passport.use(new LocalStrategy({passReqToCallback: true}, authBeforeVsac));
/* istanbul ignore next */
passport.use('utsJwt', new CustomStrategy((req, cb) => {
    const utsUsersServer = config.uts.federatedService;
    /* istanbul ignore if */
    if (!utsUsersServer) {
        cb('error: no uts server configured');
        return;
    }
    const jwtString = Buffer.from(req.body.jwtToken, 'base64').toString();
    const match = /"iss":"(\w+)"/.exec(jwtString);
    const username = match && match[1];
    if (!username) {
        cb('no user');
        return;
    }
    fetch(`${utsUsersServer}/rest/content/angular/profile/getprofile?username=${username}&app=angular`, {
        headers: {
            Authorization: 'Bearer ' + req.body.jwtToken
        }
    })
        .then(isStatus([200]))
        .then<any>(json)
        .then((profile) => {
            if (username !== profile.user.username) {
                cb('usernames did not match');
                return;
            }
            findAddUserLocally({username, ip: req.ip}, (err, userDoc) => {
                cb(err, userDoc);
            });
        })
        .catch(() => cb('api error'));
}));

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
                    orgEditor: [],
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

export const umlsAuth: RequestHandler = (req, res, next) => {
    const apiKey = req.query.apiKey as string;
    if (!apiKey || !apiKey.length) {
        next();
        return;
    }
    umlsApiKeyValidate(apiKey, (err, username) => {
        if (err || !username) {
            next(); // drop error, continue unauthenticated
            return;
        }
        req.user = dummyUser; // retrieve codes even if not a CDE user, do not allow use of user privileges
        next();
    });
};
