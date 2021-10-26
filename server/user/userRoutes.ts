import * as Config from 'config';
import { RequestHandler, Router } from 'express';
import { authenticate } from 'passport';
import { isOrgAuthorityMiddleware, loggedInMiddleware, nocacheMiddleware } from 'server/system/authorization';
import { taskAggregator } from 'server/user/taskAggregatorSvc';
import {
    byId as userById, byUsername, save as userSave, updateUser, userByName, UserFull, usersByUsername
} from 'server/user/userDb';
import { version } from 'server/version';

const config = Config as any;
require('express-async-errors');

export function module(roleConfig: { manage: RequestHandler, search: RequestHandler }) {
    const router = Router();

    router.get('/', nocacheMiddleware, async (req, res) => {
        if (!req.user) {
            return res.send({});
        } else {
            const user = await userById(req.user._id);
            res.send(user);
        }
    });

    router.post('/', loggedInMiddleware, async (req, res) => {
        await updateUser(req.user, req.body);
        res.send();
    });

    router.post('/jwt', (req, res, next) => {
        /* istanbul ignore next */
        authenticate('utsJwt', function (err, user) {
            req.logIn(user, function () {
                res.status(err ? 401 : 200).send(err ? err : user);
            });
        })(req, res, next);
    });

    router.get('/usernames/:username', async (req, res) => {
        const users = await usersByUsername(req.params.username);
        res.send(users.map(u => u.username.toLowerCase()));
    });

    router.get('/searchUsers/:username?', roleConfig.search, async (req, res) => {
        const users = await usersByUsername(req.params.username);
        res.send(users);
    });


    if (!config.proxy) {
        router.post('/site-version', (req, res) => {
            (version as any) = version + '.';
            res.send();
        });
    }

    router.get('/tasks/:clientVersion', nocacheMiddleware, async (req, res) => {
        const tasks = await taskAggregator(req.user, req.params.clientVersion);
        res.send(tasks);
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
                quota: 1024 * 1024 * 1024
            };
            await userSave(newUser);
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
