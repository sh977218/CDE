import * as Config from 'config';
import { RequestHandler, Router } from 'express';
import {
    canApproveCommentMiddleware, isOrgAuthorityMiddleware, loggedInMiddleware, nocacheMiddleware
} from 'server/system/authorization';
import {
    byId as userById, byUsername, save as userSave, updateUser, userByName, UserDocument, UserFull, usersByUsername
} from 'server/user/userDb';
import { version } from 'server/version';
import { uniq } from 'lodash';
import { taskAggregator } from 'server/user/taskAggregatorSvc';

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

    router.post('/tasks/:clientVersion/read', loggedInMiddleware, async (req, res) => {
        // assume all comments for an elt have been read
        let updated = false;
        (req.user as UserFull).commentNotifications
            .filter(t => t.eltTinyId === req.body.id && t.eltModule === req.body.idType)
            .forEach(t => updated = t.read = true);
        if (!updated) {
            res.send(await taskAggregator(req.user, req.params.clientVersion));
        } else {
            await updateUser(req.user, {commentNotifications: req.user.commentNotifications});
            const user = await userById(req.user._id);
            if (!user) {
                res.status(500).send();
                return;
            }
            res.send(await taskAggregator(user, req.params.clientVersion));
        }
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
        if (!foundUser) {
            res.status(400).send();
            return;
        }
        foundUser.avatarUrl = req.body.avatarUrl;
        await foundUser.save();
        res.send();
    });

    router.post('/addCommentAuthor', canApproveCommentMiddleware, async (req, res) => {
        const foundUser = await userByName(req.body.username);
        if (!foundUser) {
            res.status(400).send();
            return;
        }
        foundUser.roles.push('CommentAuthor');
        uniq(foundUser.roles);
        await foundUser.save();
        res.send();
    });

    return router;
}
