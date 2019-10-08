import * as Config from 'config';
import { Request, RequestHandler, Response, Router } from 'express';
import { unapproved as attachmentUnapproved } from 'server/attachment/attachmentSvc';
import { unapproved as discussUnapproved } from 'server/discuss/discussDb';
import { handleError, handleNotFound } from 'server/errorHandler/errorHandler';
import { getClientErrorsNumber, getServerErrorsNumber } from 'server/log/dbLogger';
import { hasRole, isSiteAdmin } from 'shared/system/authorizationShared';
import {
    canApproveCommentMiddleware, isOrgAuthorityMiddleware, loggedInMiddleware, nocacheMiddleware
} from 'server/system/authorization';
import { ItemDocument } from 'server/system/mongo-data';
import {
    byId as userById, byUsername, save as userSave, updateUser, userByName, UserFull, usersByUsername
} from 'server/user/userDb';
import { getModule } from 'shared/elt';
import { uriView } from 'shared/item';
import { Comment, CommentReply, ModuleAll, Task } from 'shared/models.model';
import { capString } from 'shared/system/util';
import { promisify } from 'util';
import { version } from '../version';
import { uniq } from 'lodash';

const config = Config as any;

export function module(roleConfig: { manage: RequestHandler, search: RequestHandler }) {
    const router = Router();

    router.get('/', nocacheMiddleware, (req, res) => {
        if (!req.user) {
            return res.send({});
        }
        userById(req.user._id, handleNotFound({req, res}, user => {
            res.send(user);
        }));
    });

    router.post('/', loggedInMiddleware, (req, res) => {
        updateUser(req.user, req.body, handleNotFound({req, res}, () => {
            res.send();
        }));
    });

    router.get('/usernames/:username', (req, res) => {
        usersByUsername(req.params.username, handleNotFound({req, res}, users => {
            res.send(users.map(u => u.username.toLowerCase()));
        }));
    });

    router.get('/searchUsers/:username?', roleConfig.search, (req, res) => {
        usersByUsername(req.params.username, handleNotFound({req, res}, users => {
            res.send(users);
        }));
    });

    async function taskAggregator(req: Request, res: Response) {
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

        function pending(comment: Comment) {
            let pending: CommentReply[] = [];
            if (comment.pendingApproval) {
                pending.push(comment);
            }
            if (Array.isArray(comment.replies)) {
                pending = pending.concat(comment.replies.filter(r => r.pendingApproval));
            }
            return pending;
        }

        const user = req.user;
        const tasks = user ? user.commentNotifications.map(createTaskFromCommentNotification) : [];

        let clientErrorPromise;
        let serverErrorPromise;
        let unapprovedAttachmentsPromise;
        let unapprovedCommentsPromise;

        if (isSiteAdmin(user)) {
            clientErrorPromise = getClientErrorsNumber(user).then(clientErrorCount => {
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
            });
            serverErrorPromise = getServerErrorsNumber(user).then(serverErrorCount => {
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
            });
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
            unapprovedAttachmentsPromise = (promisify(attachmentUnapproved)() as any).then((attachmentElts: ItemDocument[]) => {
                if (Array.isArray(attachmentElts)) {
                    attachmentElts.forEach(elt => {
                        const eltModule = getModule(elt);
                        const eltTinyId = elt.tinyId;
                        elt.attachments
                            .filter(a => !!a.pendingApproval)
                            .forEach(a => {
                                const task: Task = {
                                    date: new Date(),
                                    id: a.fileid,
                                    idType: 'attachment',
                                    name: '',
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
            });
        }
        if (hasRole(user, 'CommentReviewer')) { // required, req.user.notificationSettings.approvalComment.drawer not used
            unapprovedCommentsPromise = discussUnapproved().then(comments => {
                if (Array.isArray(comments)) {
                    comments.forEach(c => {
                        const eltModule: ModuleAll = c.element.eltType;
                        const eltTinyId: string = c.element.eltId;
                        pending(c).forEach(p => {
                            const task: Task = {
                                date: new Date(),
                                id: p._id,
                                idType: p === c ? 'comment' : 'commentReply',
                                name: '',
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
                            const username = p.user && p.user.username || c.user && c.user.username;
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
            });
        }

        await clientErrorPromise;
        await serverErrorPromise;
        await unapprovedAttachmentsPromise;
        await unapprovedCommentsPromise;
        res.send(tasks);
    }

    if (!config.proxy) {
        router.post('/site-version', (req, res) => {
            // @ts-ignore
            version = version + '.';
            res.send();
        });
    }

    router.get('/tasks/:clientVersion', nocacheMiddleware, taskAggregator);

    router.post('/tasks/:clientVersion/read', loggedInMiddleware, (req, res) => {
        // assume all comments for an elt have been read
        let updated = false;
        req.user.commentNotifications
            .filter(t => t.eltTinyId === req.body.id && t.eltModule === req.body.idType)
            .forEach(t => updated = t.read = true);
        if (!updated) {
            taskAggregator(req, res);
            return;
        }
        updateUser(req.user, {commentNotifications: req.user.commentNotifications}, handleError({req, res}, () => {
            userById(req.user._id, handleNotFound({req, res}, user => {
                req.user = user;
                taskAggregator(req, res);
            }));
        }));
    });

    router.post('/addUser', roleConfig.manage, async (req, res) => {
        const username = req.body.username;
        const existingUser = await byUsername(username);
        if (existingUser) {
            return res.status(409).send('Duplicated username');
        }
        const newUser: Partial<UserFull> = {
            username: username.toLowerCase(),
            password: 'umls',
            quota: 1024 * 1024 * 1024
        };
        await userSave(newUser);
        res.send(username + ' added.');
    });


    router.post('/updateUserRoles', isOrgAuthorityMiddleware, async (req, res) => {
        const foundUser = await userByName(req.body.username);
        if (!foundUser) {
            res.status(404).send();
        } else {
            foundUser.roles = req.body.roles;
            await foundUser.save();
            res.send();
        }
    });
    router.post('/updateUserAvatar', isOrgAuthorityMiddleware, async (req, res) => {
        const foundUser = await userByName(req.body.username);
        if (!foundUser) {
            res.status(404).send();
        } else {
            foundUser.avatarUrl = req.body.avatarUrl;
            await foundUser.save();
            res.send();
        }
    });
    router.post('/addCommentAuthor', canApproveCommentMiddleware, async (req, res) => {
        const foundUser = await userByName(req.body.username);
        if (!foundUser) {
            res.status(404).send();
        } else {
            foundUser.roles.push('CommentAuthor');
            uniq(foundUser.roles);
            await foundUser.save();
            res.send();
        }
    });

    return router;
}
