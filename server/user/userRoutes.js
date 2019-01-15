const config = require('config');
const itemShared = require('esm')(module)('../../shared/item');
const eltShared = require('esm')(module)('../../shared/elt');
const authorizationShared = require('esm')(module)('../../shared/system/authorizationShared');
const utilShared = require('esm')(module)('../../shared/system/util');
const attachment = require('../attachment/attachmentSvc');
const discussDb = require('../discuss/discussDb');
const dbLogger = require('../log/dbLogger');
const handle404 = dbLogger.handle404;
const handleError = dbLogger.handleError;
const notificationDb = require('../notification/notificationDb');
const authorization = require('../system/authorization');
const nocacheMiddleware = authorization.nocacheMiddleware;
const loggedInMiddleware = authorization.loggedInMiddleware;
const mongo_data = require('../system/mongo-data');
const userDb = require('./userDb');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    let version = "local-dev";
    try {
        version = require('../system/version.js').version;
    } catch (e) {
    }

    router.get('/', [nocacheMiddleware], (req, res) => {
        if (!req.user) return res.send({});
        userDb.byId(req.user._id, handle404({req, res}, user => {
            res.send(user);
        }));
    });

    router.post('/', [loggedInMiddleware], (req, res) => {
        userDb.updateUser(req.user, req.body, handle404({req, res}, () => {
            res.send();
        }));
    });

    router.get('/avatar/:username', (req, res) => {
        userDb.avatarByUsername(req.params.username, handle404({req, res}, avatar => {
            res.send(avatar);
        }));
    });
    router.get('/usernames/:username', (req, res) => {
        userDb.usersByUsername(req.params.username, handle404({req, res}, users => {
            res.send(users.map(u => u.username.toLowerCase()));
        }));
    });

    router.get('/mailStatus', [loggedInMiddleware], (req, res) => {
        mongo_data.mailStatus(req.user, handle404({req, res}, mails => {
            res.send({count: mails.length});
        }));
    });

    router.get('/searchUsers/:username?', roleConfig.search, (req, res) => {
        userDb.usersByUsername(req.params.username, handle404({req, res}, users => {
            res.send(users);
        }));
    });

    function taskAggregator(req, res) {
        const handlerOptions = {req, res};
        const errorHandler = handleError.bind(undefined, handlerOptions);
        if (req.user) {
            userDb.byId(req.user._id, errorHandler(taskAggregate)); // get user this request for real-time user.commentNotifications
        } else {
            taskAggregate(undefined);
        }

        function taskAggregate(user) {
            let tasks = user ? user.commentNotifications.map(createTaskFromCommentNotification) : [];

            let client = -1;
            let server = -1;
            let attachmentElts;
            let comments;
            if (authorizationShared.isSiteAdmin(user)) {
                notificationDb.getNumberClientError(user, errorHandler(clientErrorCount => {
                    client = clientErrorCount;
                    tasksDone();
                }));
                notificationDb.getNumberServerError(user, errorHandler(serverErrorCount => {
                    server = serverErrorCount;
                    tasksDone();
                }));
            } else {
                client = 0;
                server = 0;
                tasksDone();
            }
            // TODO: implement org boundaries
            if (authorizationShared.hasRole(user, 'AttachmentReviewer')) { // required, req.user.notificationSettings.approvalAttachment.drawer not used
                attachment.unapproved(errorHandler(a => {
                    attachmentElts = a;
                    tasksDone();
                }));
            } else {
                attachmentElts = [];
                tasksDone();
            }
            if (authorizationShared.hasRole(user, 'CommentReviewer')) { // required, req.user.notificationSettings.approvalComment.drawer not used
                discussDb.unapproved(errorHandler(c => {
                    comments = c;
                    tasksDone();
                }));
            } else {
                comments = [];
                tasksDone();
            }

            function createTaskFromCommentNotification(c) {
                return {
                    date: c.date,
                    id: c.eltTinyId,
                    idType: c.eltModule,
                    name: c.username + ' commented',
                    properties: [{
                        key: utilShared.capString(c.eltModule),
                        value: c.eltTinyId,
                    }],
                    source: 'user',
                    state: !c.read && 1 || 0,
                    text: c.text,
                    type: 'comment',
                    url: itemShared.uriView(c.eltModule, c.eltTinyId),
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

            function tasksDone() {
                if (client === -1 || server === -1 || !attachmentElts || !comments) {
                    return;
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
                if (client > 0) {
                    tasks.push({
                        id: client,
                        idType: 'clientError',
                        name: client + ' New Client Errors',
                        source: 'calculated',
                        type: 'message',
                        url: '/siteAudit?tab=clientError',
                    });
                }
                if (server > 0) {
                    tasks.push({
                        id: server,
                        idType: 'serverError',
                        name: server + ' New Server Errors',
                        source: 'calculated',
                        type: 'message',
                        url: '/siteAudit?tab=serverError',
                    });
                }
                if (Array.isArray(attachmentElts)) {
                    attachmentElts.forEach(elt => {
                        const eltModule = eltShared.getModule(elt);
                        const eltTinyId = elt.tinyId;
                        elt.attachments
                            .filter(a => !!a.pendingApproval)
                            .forEach(a => {
                                let task = {
                                    id: a.fileid,
                                    idType: 'attachment',
                                    properties: [
                                        {
                                            key: utilShared.capString(eltModule),
                                            value: eltTinyId,
                                        }
                                    ],
                                    source: 'calculated',
                                    text: a.filetype + '\n' + a.filename + '\n' + a.comment,
                                    type: 'approve',
                                    url: itemShared.uriView(eltModule, eltTinyId)
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
                                        key: utilShared.capString(eltModule),
                                        value: eltTinyId,
                                    }
                                ],
                                source: 'calculated',
                                text: p.text,
                                type: 'approve',
                                url: itemShared.uriView(eltModule, eltTinyId),
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
                res.send(tasks);
            }
        }
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
        userDb.byId(req.user._id, handle404({req, res}, user => {
            let updated = false;
            user.commentNotifications
                .filter(t => t.eltTinyId === req.body.id && t.eltModule === req.body.idType)
                .forEach(t => updated = t.read = true);
            if (!updated) {
                taskAggregator(req, res);
                return;
            }
            userDb.updateUser(user, {commentNotifications: user.commentNotifications}, handleError({req, res}, () => {
                taskAggregator(req, res);
            }));
        }));
    });

    router.post('/addUser', roleConfig.manage, (req, res) => {
        let username = req.body.username;
        userDb.byUsername(username, handleError({req, res}, existingUser => {
            if (existingUser) return res.status(409).send("Duplicated username");
            let newUser = {
                username: username.toLowerCase(),
                password: "umls",
                quota: 1024 * 1024 * 1024
            };
            userDb.save(newUser, handleError({req, res}, () => res.send(username + " added.")));
        }));
    });

    router.post('/updateNotificationDate', roleConfig.notificationDate, (req, res) => {
        let notificationDate = req.body;
        withRetry(handleConflict => {
            userDb.byId(req.user._id, handle404({req, res}, user => {
                if (user) {
                    let changed = false;
                    if (notificationDate.clientLogDate) {
                        user.notificationDate.clientLogDate = notificationDate.clientLogDate;
                        changed = true;
                    }
                    if (notificationDate.serverLogDate) {
                        user.notificationDate.serverLogDate = notificationDate.serverLogDate;
                        changed = true;
                    }
                    if (changed) {
                        user.save(handleConflict({req, res}, () => res.send()));
                    }
                }
            }));
        });
    });
    return router;
};

function withRetry(tryCb, retries = 1) {
    function handleConflict(options, cb) {
        return function errorHandler(err, ...args) {
            if (err) {
                if (retries > 0) {
                    retries--;
                    tryCb(handleConflict);
                } else {
                    exports.respondError(err, options);
                }
                return;
            }
            cb(...args);
        };
    }

    tryCb(handleConflict);
}
