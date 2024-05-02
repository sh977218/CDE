import { RequestHandler, Response, Router } from 'express';
import { respondPromise } from 'server/errorHandler';
import {
    canSubmissionSubmitMiddleware,
    isOrgAuthorityMiddleware,
    loggedInMiddleware,
    nocacheMiddleware,
} from 'server/system/authorization';
import {
    byId as userById,
    byUsername,
    governanceReviewers,
    nlmCurators,
    orgCurators,
    addNewUser,
    updateUser,
    userByName,
    UserFull,
    usersByUsername,
} from 'server/user/userDb';

require('express-async-errors');
const passport = require('passport'); // must use require to preserve this pointer

export function module(roleConfig: { manage: RequestHandler; search: RequestHandler }) {
    const router = Router();

    router.get('/', nocacheMiddleware, async (req, res): Promise<Response> => {
        if (!req.user) {
            return res.send({});
        }
        return respondPromise(
            { res },
            userById(req.user._id).then(user => user)
        );
    });

    router.post('/', loggedInMiddleware, async (req, res): Promise<Response> => {
        return respondPromise({ res }, updateUser(req.user, req.body));
    });

    router.get('/governanceReviewerNames', canSubmissionSubmitMiddleware, (req, res): Promise<Response> => {
        return governanceReviewers().then(users => res.send(users.map(user => user.username)));
    });

    router.get('/nlmCuratorNames', canSubmissionSubmitMiddleware, (req, res): Promise<Response> => {
        return nlmCurators().then(users => res.send(users.map(user => user.username)));
    });

    router.get('/orgCuratorNames/:org', canSubmissionSubmitMiddleware, (req, res) => {
        orgCurators([req.params.org], (err, users) => {
            if (err && !users) {
                res.status(400).send();
            }
            res.send(users.map(u => u.username));
        });
    });

    router.get('/usernames/:username', async (req, res) => {
        const users = await usersByUsername(req.params.username);
        res.send(users.map(u => u.username.toLowerCase()));
    });

    router.get('/searchUsers/:username?', roleConfig.search, async (req, res) => {
        const users = await usersByUsername(req.params.username);
        res.send(users);
    });

    router.post('/addUser', roleConfig.manage, async (req, res) => {
        const username = req.body.username;
        const foundUser = await byUsername(username);
        if (foundUser) {
            return res.status(409).send('Duplicated username');
        } else {
            const newUser: Partial<UserFull> = {
                username: username.toLowerCase(),
                password: 'umls',
                quota: 1024 * 1024 * 1024,
            };
            await addNewUser(newUser);
            res.send(username + ' added.');
        }
    });

    router.post('/updateUserRoles', isOrgAuthorityMiddleware, async (req, res) => {
        const foundUser = await userByName(req.body.username);
        /* istanbul ignore if */
        if (!foundUser) {
            res.status(400).send();
            return;
        }
        foundUser.roles = req.body.roles;
        await foundUser.save();
        res.send();
    });

    router.post('/updateUserAvatar', isOrgAuthorityMiddleware, async (req, res) => {
        const foundUser = await userByName(req.body.username);
        /* istanbul ignore if */
        if (!foundUser) {
            res.status(400).send();
            return;
        }
        foundUser.avatarUrl = req.body.avatarUrl;
        await foundUser.save();
        res.send();
    });

    return router;
}
