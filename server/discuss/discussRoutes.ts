import { Request, Response } from 'express';
import { Cb } from 'shared/models.model';
import { canComment, canRemoveComment } from 'shared/system/authorizationShared';
import { handle40x, handleError } from '../errorHandler/errorHandler';

const async = require('async');
const authorization = require('../system/authorization');
const loggedInMiddleware = authorization.loggedInMiddleware;
const discussDb = require('./discussDb');
const daoManager = require('../system/moduleDaoManager');
const ioServer = require('../system/ioServer');
const userDb = require('../user/userDb');
const userService = require('../system/usersrvc');
const mongo_data = require('../system/mongo-data');
const adminItemService = require('../system/adminItemSvc');

require('express-async-errors');

function getEltUsers(elt, cb: Cb<string[]>) {
    let userIds = [];
    if (elt.owner && elt.owner.userId) {
        userIds.push(elt.owner.userId);
    }
    if (Array.isArray(elt.users)) {
        async.map(
            elt.users.filter(u => !!u.username),
            (u, doneOne) => userDb.byUsername(u.username, doneOne),
            (err, users) => {
                users.forEach(user => user && user._id && userIds.push(user._id));
                cb(userIds);
            }
        );
    } else {
        cb();
    }
}

export function module(roleConfig) {
    const router = require('express').Router();

    router.get('/comments/eltId/:eltId', (req, res) => {
        discussDb.byEltId(req.params.eltId, handleError({req, res}, comments => {
            comments.forEach(c => {
                if (c.pendingApproval) c.text = 'This comment is pending approval';
                c.replies.forEach(r => {
                    if (r.pendingApproval) r.text = 'This reply is pending approval';
                });
            });
            res.send(comments);
        }));
    });

    router.post('/postComment', loggedInMiddleware, async (req, res) => {
        const handlerOptions = {req, res};
        const comment = req.body;
        const eltModule = comment.element && comment.element.eltType;
        const eltTinyId = comment.element && comment.element.eltId;
        let numberUnapprovedMessages = await discussDb.numberUnapprovedMessageByUsername(req.user.username);
        if (numberUnapprovedMessages >= 5) return res.status(403).send('You have too many unapproved messages.');
        mongo_data.fetchItem(eltModule, eltTinyId, handle40x(handlerOptions, elt => {
            comment.user = req.user;
            comment.created = new Date().toJSON();
            if (!canComment(req.user)) {
                comment.pendingApproval = true;
            }
            discussDb.save(comment, handleError(handlerOptions, savedComment => {
                ioServerCommentUpdated(req.user.username, eltTinyId);
                if (savedComment.pendingApproval) {
                    adminItemService.createTask(req.user, 'CommentReviewer', 'approval', eltModule,
                        eltTinyId, 'comment');
                } else {
                    getEltUsers(elt, userIds => {
                        adminItemService.notifyForComment({}, savedComment, eltModule, eltTinyId,
                            elt.stewardOrg && elt.stewardOrg.name, userIds);
                    });
                }
                res.send({});
            }));
        }));
    });

    router.post('/replyComment', loggedInMiddleware, async (req, res) => {
        const handlerOptions = {req, res};
        let numberUnapprovedMessages = await discussDb.numberUnapprovedMessageByUsername(req.user.username);
        if (numberUnapprovedMessages >= 5) return res.status(403).send('You have too many unapproved messages.');
        discussDb.byId(req.body.commentId, handle40x(handlerOptions, comment => {
            const eltModule = comment.element && comment.element.eltType;
            const eltTinyId = comment.element && comment.element.eltId;
            let numberUnapprovedReplies = comment.replies.filter(r => r.pendingApproval && r.user.username === req.user.username).length;
            if (numberUnapprovedReplies > 0) return res.status(403).send('You cannot do this.');
            let reply: any = {
                user: req.user,
                created: new Date().toJSON(),
                text: req.body.reply
            };
            if (!canComment(req.user)) {
                reply.pendingApproval = true;
            }
            comment.replies.push(reply);
            discussDb.save(comment, handleError(handlerOptions, savedComment => {
                ioServerCommentUpdated(req.user.username, comment.element.eltId);
                if (reply.pendingApproval) {
                    adminItemService.createTask(req.user, 'CommentReviewer', 'approval', eltModule,
                        eltTinyId, 'comment');
                } else {
                    mongo_data.fetchItem(eltModule, eltTinyId, handle40x({}, elt => {
                        getEltUsers(elt, userIds => {
                            adminItemService.notifyForComment({}, savedComment.replies.filter(r =>
                                +new Date(r.created) === +new Date(reply.created))[0], eltModule, eltTinyId,
                                elt.stewardOrg && elt.stewardOrg.name, userIds);
                        });
                    }));
                }
                if (req.user.username !== savedComment.user.username) {
                    let message = {
                        author: {authorType: 'user', name: req.user.username},
                        date: new Date(),
                        recipient: {recipientType: 'user', name: savedComment.user.username},
                        type: 'CommentReply',
                        typeCommentReply: {
                            // TODO change this when you merge board comments
                            element: {
                                eltType: savedComment.element.eltType,
                                eltId: savedComment.element.eltId,
                                name: req.body.eltName
                            },
                            comment: {
                                commentId: savedComment._id,
                                text: reply.text
                            }
                        },
                        states: []
                    };
                    mongo_data.createMessage(message);
                }
                res.send({});
            }));
        }));
    });

    router.post('/deleteComment', loggedInMiddleware, (req, res) => {
        let commentId = req.body.commentId;
        discussDb.byId(commentId, handle40x({req, res}, comment => {
            let dao = daoManager.getDao(comment.element.eltType);
            let idRetrievalFunc = dao.byTinyId ? dao.byTinyId : dao.byId;
            let eltId = comment.element.eltId;
            idRetrievalFunc(eltId, handle40x({req, res}, element => {
                if (!canRemoveComment(req.user, comment, element)) {
                    return res.status(403).send('You can only remove ' + element.type + ' you own.');
                }
                comment.remove(handleError({req, res}, () => {
                    ioServerCommentUpdated(req.user.username, comment.element.eltId);
                    res.send({});
                }));
            }));
        }));
    });

    router.post('/deleteReply', loggedInMiddleware, (req, res) => {
        let replyId = req.body.replyId;
        discussDb.byReplyId(replyId, handle40x({req, res}, comment => {
            let dao = daoManager.getDao(comment.element.eltType);
            let idRetrievalFunc = dao.byTinyId ? dao.byTinyId : dao.byId;
            let eltId = comment.element.eltId;
            idRetrievalFunc(eltId, handle40x({req, res}, element => {
                if (!canRemoveComment(req.user, comment, element)) {
                    return res.status(403).send('You can only remove ' + element.type + ' you own.');
                }
                comment.replies = comment.replies.filter(r => r._id.toString() !== replyId);
                comment.save(handleError({req, res}, () => {
                    ioServerCommentUpdated(req.user.username, comment.element.eltId);
                    res.send({});
                }));
            }));
        }));
    });

    function respondCommentOrgsByCriteria(req: Request, res: Response, criteria: any) {
        const handlerOptions = {req, res};
        const from = Number.parseInt(req.params.from);
        const size = Number.parseInt(req.params.size);
        const orgName: string | string[] = req.params.orgName;
        discussDb.orgCommentsByCriteria(
            criteria,
            orgName ? (Array.isArray(orgName) ? orgName : [orgName]) : undefined,
            from,
            size,
            handleError(handlerOptions, comments => res.send(comments))
        );
    }

    router.get('/allComments/:from/:size/:orgName?', roleConfig.allComments, (req: Request, res: Response) => {
        respondCommentOrgsByCriteria(req, res, {});
    });

    router.get('/myComments/:from/:size/:orgName?', loggedInMiddleware, (req: Request, res: Response) => {
        respondCommentOrgsByCriteria(req, res, {username: req.user.username});
    });

    router.get('/orgComments/:from/:size/:orgName?', loggedInMiddleware, (req: Request, res: Response) => {
        if (!req.params.orgName) {
            req.params.orgName = userService.myOrgs(req.user);
        }
        respondCommentOrgsByCriteria(req, res, {});
    });

    router.post('/approveComment', roleConfig.manageComment, (req, res) => {
        if (req.body.replyId) {
            discussDb.byReplyId(req.body.replyId, handle40x({req, res}, comment => {
                comment.replies.filter(r => r._id.toString() === req.body.replyId).map(r => r.pendingApproval = false);
                comment.save(handleError({req, res}, () => res.send('Approved')));
            }));
        } else {
            discussDb.byId(req.body.commentId, handle40x({req, res}, comment => {
                comment.pendingApproval = false;
                comment.save(handleError({req, res}, () => res.send('Approved')));
            }));
        }
    });

    router.post('/declineComment', roleConfig.manageComment, (req, res) => {
        if (req.body.replyId) {
            discussDb.byReplyId(req.body.replyId, handle40x({req, res}, comment => {
                comment.replies = comment.replies.filter(r => r._id.toString() !== req.body.replyId);
                comment.save(handleError({req, res}, () => res.send('Declined')));
            }));
        } else {
            discussDb.byId(req.body.commentId, handle40x({req, res}, comment => {
                comment.pendingApproval = false;
                comment.remove(handleError({req, res}, () => res.send('Declined')));
            }));
        }
    });

    router.post('/resolveComment', loggedInMiddleware, (req, res) => {
        discussDb.byId(req.body.commentId, handle40x({req, res}, comment => {
            replyTo(req, res, comment, 'resolved');
        }));
    });

    router.post('/reopenComment', loggedInMiddleware, (req, res) => {
        discussDb.byId(req.body.commentId, handle40x({req, res}, comment => {
            replyTo(req, res, comment, 'active');
        }));
    });

    router.post('/resolveReply', loggedInMiddleware, (req, res) => {
        discussDb.byReplyId(req.body.replyId, handle40x({req, res}, comment => {
            replyTo(req, res, comment, undefined, 'resolved');
        }));
    });

    router.post('/reopenReply', loggedInMiddleware, (req, res) => {
        discussDb.byReplyId(req.body.replyId, handle40x({req, res}, comment => {
            replyTo(req, res, comment, undefined, 'active');
        }));
    });

    return router;
}

let ioServerCommentUpdated = (username, roomId) => ioServer.ioServer.of('/comment').to(roomId).emit('commentUpdated', {username: username});

function replyTo(req, res, comment, status, repliesStatus?: string, send = {}) {
    if (status) {
        comment.status = status;
    }
    if (repliesStatus) {
        comment.replies.filter(r => r._id.toString() === req.body.replyId).map(r => r.status = repliesStatus);
    }
    comment.save(handleError({req, res}, () => {
        ioServerCommentUpdated(req.user.username, comment.element.eltId);
        res.send(send);
    }));
}
