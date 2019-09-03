import { uriView } from 'shared/item';
import { getModule } from 'shared/elt';
import { hasRole, isSiteAdmin } from 'shared/system/authorizationShared';
import { capString } from 'shared/system/util';
import { loggedInMiddleware, nocacheMiddleware } from '../system/authorization';
import { handle40x, handleError, respondError } from '../errorHandler/errorHandler';

const config = require('config');
const attachment = require('../attachment/attachmentSvc');
const discussDb = require('../discuss/discussDb');
const notificationDb = require('../notification/notificationDb');
const mongo_data = require('../system/mongo-data');
const userDb = require('./userDb');

export function module(roleConfig) {
    const router = require('express').Router();

    let version = "local-dev";
    try {
        version = require('../system/version.js').version;
    } catch (e) {
    }

    router.get('/', [nocacheMiddleware], (req, res) => {
        if (!req.user) return res.send({});
        userDb.byId(req.user._id, handle40x({req, res}, user => {
            res.send(user);
        }));
    });

    router.post('/', [loggedInMiddleware], (req, res) => {
        userDb.updateUser(req.user, req.body, handle40x({req, res}, () => {
            res.send();
        }));
    });

    router.get('/usernames/:username', (req, res) => {
        userDb.usersByUsername(req.params.username, handle40x({req, res}, users => {
            res.send(users.map(u => u.username.toLowerCase()));
        }));
    });

    router.get('/searchUsers/:username?', roleConfig.search, (req, res) => {
        userDb.usersByUsername(req.params.username, handle40x({req, res}, users => {
            res.send(users);
        }));
    });

    async function taskAggregator(req, res) {
        const handlerOptions = {req, res};

        function createTaskFromCommentNotification(c) {
            return {
                date: c.date,
                id: c.eltTinyId,
                idType: c.eltModule,
                name: c.username + ' commented',
                properties: [{
                    key: capString(c.eltModule),
                    value: c.eltTinyId,
                }],
                source: 'user',
                state: !c.read && 1 || 0,
                text: c.text,
                type: 'comment',
                url: uriView(c.eltModule, c.eltTinyId),
            };
        }

        function pending(comment) {
            let pending = [];
            if (comment.pendingApproval) {
                pending.push(comment);
            }
            if (Array.isArray(comment.replies)) {
                pending = pending.concat(comment.replies.filter(r => r.pendingApproval));
            }
            return pending;
        }

        let user = req.user;
        let tasks = user ? user.commentNotifications.map(createTaskFromCommentNotification) : [];

        if (isSiteAdmin(user)) {
            let clientErrorCount = await notificationDb.getNumberClientError(user);
            if (clientErrorCount > 0) {
                tasks.push({
                    id: clientErrorCount,
                    idType: 'clientError',
                    name: clientErrorCount + ' New Client Errors',
                    source: 'calculated',
                    type: 'message',
                    url: '/siteAudit?tab=clientErrors',
                });
            }

            let serverErrorCount = await notificationDb.getNumberServerError(user);
            if (serverErrorCount > 0) {
                tasks.push({
                    id: serverErrorCount,
                    idType: 'serverError',
                    name: serverErrorCount + ' New Server Errors',
                    source: 'calculated',
                    type: 'message',
                    url: '/siteAudit?tab=serverErrors',
                });
            }
        }

        if (req.params.clientVersion && version !== req.params.clientVersion) {
            tasks.push({
                id: version,
                idType: 'versionUpdate',
                name: 'Website Updated',
                source: 'calculated',
                text: 'A new version of this site is available. To enjoy the new features, please close all CDE tabs then load again.',
                type: 'error',
            });
        }

        // TODO: implement org boundaries
        if (hasRole(user, 'AttachmentReviewer')) { // required, req.user.notificationSettings.approvalAttachment.drawer not used
            let attachmentElts = await new Promise((resolve, reject) => {
                attachment.unapproved((err, results) => {
                    if (err) return reject (err);
                    resolve(results);
                });
            });

            if (Array.isArray(attachmentElts)) {
                attachmentElts.forEach(elt => {
                    const eltModule = getModule(elt);
                    const eltTinyId = elt.tinyId;
                    elt.attachments
                        .filter(a => !!a.pendingApproval)
                        .forEach(a => {
                            let task: any = {
                                id: a.fileid,
                                idType: 'attachment',
                                properties: [
                                    {
                                        key: capString(eltModule),
                                        value: eltTinyId,
                                    }
                                ],
                                source: 'calculated',
                                text: a.filetype + '\n' + a.filename + '\n' + a.comment,
                                type: 'approve',
                                url: uriView(eltModule, eltTinyId)
                            };
                            if (a.uploadedBy && a.uploadedBy.username) {
                                task.properties.unshift({
                                    key: 'User',
                                    value: a.uploadedBy.username
                                });
                            }
                            if (!a.scanned) {
                                task.properties.push({
                                    key: 'NOT VIRUS SCANNED'
                                });
                            }
                            tasks.push(task);
                        });
                });
            }
        }
        if (hasRole(user, 'CommentReviewer')) { // required, req.user.notificationSettings.approvalComment.drawer not used
            let comments = await discussDb.unapproved();
            if (Array.isArray(comments)) {
                comments.forEach(c => {
                    const eltModule = c.element && c.element.eltType;
                    const eltTinyId = c.element && c.element.eltId;
                    pending(c).forEach(p => {
                        let task = {
                            id: p._id,
                            idType: p === c ? 'comment' : 'commentReply',
                            properties: [
                                {
                                    key: capString(eltModule),
                                    value: eltTinyId,
                                }
                            ],
                            source: 'calculated',
                            text: p.text,
                            type: 'approve',
                            url: uriView(eltModule, eltTinyId),
                        };
                        let username = p.user && p.user.username || c.user && c.user.username;
                        if (username) {
                            task.properties.unshift({
                                key: 'User',
                                value: username
                            });
                        }
                        tasks.push(task);
                    });
                });
            }
        }

        res.send(tasks);
    }

    if (!config.proxy) {
        router.post('/site-version', (req, res) => {
            version = version + ".";
            res.send();
        });
    }

    router.get('/tasks/:clientVersion', [nocacheMiddleware], taskAggregator);

    router.post('/tasks/:clientVersion/read', [loggedInMiddleware], (req, res) => {
        // assume all comments for an elt have been read
        let updated = false;
        req.user.commentNotifications
            .filter(t => t.eltTinyId === req.body.id && t.eltModule === req.body.idType)
            .forEach(t => updated = t.read = true);
        if (!updated) {
            taskAggregator(req, res);
            return;
        }
        userDb.updateUser(req.user, {commentNotifications: req.user.commentNotifications}, handleError({req, res}, () => {
            userDb.byId(req.user._id, handle40x({req, res}, user => {
                req.user = user;
                taskAggregator(req, res);
            }));
        }));
    });

    router.post('/addUser', roleConfig.manage, async (req, res) => {
        const username = req.body.username;
        const existingUser = await userDb.byUsername(username);
        if (existingUser) return res.status(409).send("Duplicated username");
        const newUser = {
            username: username.toLowerCase(),
            password: "umls",
            quota: 1024 * 1024 * 1024
        };
        await userDb.save(newUser);
        res.send(username + " added.");
    });

    router.post('/updateNotificationDate', roleConfig.notificationDate, (req, res) => {
        let notificationDate = req.body;
        let changed = false;
        if (notificationDate.clientLogDate) {
            req.user.notificationDate.clientLogDate = notificationDate.clientLogDate;
            changed = true;
        }
        if (notificationDate.serverLogDate) {
            req.user.notificationDate.serverLogDate = notificationDate.serverLogDate;
            changed = true;
        }
        if (changed) {
            req.user.save(handleError({req, res}, () => res.send()));
        }
    });
    return router;
}
