import { Request, RequestHandler, Response, Router } from 'express';
import { byEltId, byId, byReplyId, CommentDocument, save } from 'server/discuss/discussDb';
import { handleNotFound, handleError } from 'server/errorHandler/errorHandler';
import { createMessage, fetchItem, ItemDocument, Message } from 'server/system/mongo-data';
import { Cb } from 'shared/models.model';
import { canComment, canRemoveComment } from 'shared/system/authorizationShared';
import { myOrgs } from 'server/orgManagement/orgSvc';

const async = require('async');
const authorization = require('../system/authorization');
const loggedInMiddleware = authorization.loggedInMiddleware;
const discussDb = require('./discussDb');
const daoManager = require('../system/moduleDaoManager');
const ioServer = require('../system/ioServer');
const userDb = require('../user/userDb');
const adminItemService = require('../system/adminItemSvc');

require('express-async-errors');

function getEltUsers(elt, cb: Cb<string[]>) {
    const userIds = [];
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

export function module(roleConfig: {allComments: RequestHandler, manageComment: RequestHandler}) {
    const router = Router();

    router.get('/comments/eltId/:eltId', (req, res) => {
        byEltId(req.params.eltId, handleNotFound({req, res}, comments => {
            comments.forEach(c => {
                if (c.pendingApproval) {
                    c.text = 'This comment is pending approval';
                }
                c.replies.forEach(r => {
                    if (r.pendingApproval) {
                        r.text = 'This reply is pending approval';
                    }
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
        const numberUnapprovedMessages = await discussDb.numberUnapprovedMessageByUsername(req.user.username);
        if (numberUnapprovedMessages >= 5) {
            return res.status(403).send('You have too many unapproved messages.');
        }
        fetchItem(eltModule, eltTinyId, handleNotFound(handlerOptions, elt => {
            comment.user = req.user;
            comment.created = new Date().toJSON();
            if (!canComment(req.user)) {
                comment.pendingApproval = true;
            }
            save(comment, handleNotFound(handlerOptions, savedComment => {
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
        const numberUnapprovedMessages = await discussDb.numberUnapprovedMessageByUsername(req.user.username);
        if (numberUnapprovedMessages >= 5) {
            return res.status(403).send('You have too many unapproved messages.');
        }
        byId(req.body.commentId, handleNotFound(handlerOptions, comment => {
            const eltModule = comment.element.eltType;
            const eltTinyId = comment.element.eltId;
            const numberUnapprovedReplies = comment.replies.filter(r => r.pendingApproval && r.user.username === req.user.username).length;
            if (numberUnapprovedReplies > 0) {
                return res.status(403).send('You cannot do this.');
            }
            const reply: any = {
                user: req.user,
                created: new Date().toJSON(),
                text: req.body.reply
            };
            if (!canComment(req.user)) {
                reply.pendingApproval = true;
            }
            comment.replies.push(reply);
            save(comment, handleNotFound(handlerOptions, savedComment => {
                ioServerCommentUpdated(req.user.username, comment.element.eltId);
                if (reply.pendingApproval) {
                    adminItemService.createTask(req.user, 'CommentReviewer', 'approval', eltModule,
                        eltTinyId, 'comment');
                } else {
                    fetchItem(eltModule, eltTinyId, handleNotFound({}, elt => {
                        getEltUsers(elt, userIds => {
                            adminItemService.notifyForComment({}, savedComment.replies.filter(r =>
                                +new Date(r.created) === +new Date(reply.created))[0], eltModule, eltTinyId,
                                elt.stewardOrg && elt.stewardOrg.name, userIds);
                        });
                    }));
                }
                if (req.user.username !== savedComment.user.username) {
                    const message: Message = {
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
                    createMessage(message);
                }
                res.send({});
            }));
        }));
    });

    router.post('/deleteComment', loggedInMiddleware, (req, res) => {
        const commentId = req.body.commentId;
        byId(commentId, handleNotFound({req, res}, comment => {
            const dao = daoManager.getDao(comment.element.eltType);
            const idRetrievalFunc = dao.byTinyId ? dao.byTinyId : dao.byId;
            const eltId = comment.element.eltId;
            idRetrievalFunc(eltId, handleNotFound<ItemDocument>({req, res}, element => {
                if (!canRemoveComment(req.user, comment, element)) {
                    return res.status(403).send('You can only remove ' + element.elementType + 's you own.');
                }
                comment.remove(handleError({req, res}, () => {
                    ioServerCommentUpdated(req.user.username, comment.element.eltId);
                    res.send({});
                }));
            }));
        }));
    });

    router.post('/deleteReply', loggedInMiddleware, (req, res) => {
        const replyId = req.body.replyId;
        byReplyId(replyId, handleNotFound({req, res}, comment => {
            const dao = daoManager.getDao(comment.element.eltType);
            const idRetrievalFunc = dao.byTinyId ? dao.byTinyId : dao.byId;
            const eltId = comment.element.eltId;
            idRetrievalFunc(eltId, handleNotFound<ItemDocument>({req, res}, element => {
                if (!canRemoveComment(req.user, comment, element)) {
                    return res.status(403).send('You can only remove ' + element.elementType + 's you own.');
                }
                comment.replies = comment.replies.filter(r => r._id.toString() !== replyId);
                comment.save(handleError<CommentDocument>({req, res}, () => {
                    ioServerCommentUpdated(req.user.username, comment.element.eltId);
                    res.send({});
                }));
            }));
        }));
    });

    function respondCommentOrgsByCriteria(req: Request, res: Response, criteria: any) {
        const handlerOptions = {req, res};
        const from = parseInt(req.params.from, 10);
        const size = parseInt(req.params.size, 10);
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
            req.params.orgName = myOrgs(req.user)[0];
        }
        respondCommentOrgsByCriteria(req, res, {});
    });

    router.post('/approveComment', roleConfig.manageComment, (req, res) => {
        if (req.body.replyId) {
            byReplyId(req.body.replyId, handleNotFound({req, res}, comment => {
                comment.replies.filter(r => r._id.toString() === req.body.replyId).map(r => r.pendingApproval = false);
                comment.save(handleError<CommentDocument>({req, res}, () => res.send('Approved')));
            }));
        } else {
            byId(req.body.commentId, handleNotFound({req, res}, comment => {
                comment.pendingApproval = false;
                comment.save(handleError<CommentDocument>({req, res}, () => res.send('Approved')));
            }));
        }
    });

    router.post('/declineComment', roleConfig.manageComment, (req, res) => {
        if (req.body.replyId) {
            byReplyId(req.body.replyId, handleNotFound({req, res}, comment => {
                comment.replies = comment.replies.filter(r => r._id.toString() !== req.body.replyId);
                comment.save(handleError<CommentDocument>({req, res}, () => res.send('Declined')));
            }));
        } else {
            byId(req.body.commentId, handleNotFound({req, res}, comment => {
                comment.pendingApproval = false;
                comment.remove(handleError({req, res}, () => res.send('Declined')));
            }));
        }
    });

    router.post('/resolveComment', loggedInMiddleware, (req, res) => {
        discussDb.byId(req.body.commentId, handleNotFound({req, res}, comment => {
            replyTo(req, res, comment, 'resolved');
        }));
    });

    router.post('/reopenComment', loggedInMiddleware, (req, res) => {
        discussDb.byId(req.body.commentId, handleNotFound({req, res}, comment => {
            replyTo(req, res, comment, 'active');
        }));
    });

    router.post('/resolveReply', loggedInMiddleware, (req, res) => {
        discussDb.byReplyId(req.body.replyId, handleNotFound({req, res}, comment => {
            replyTo(req, res, comment, undefined, 'resolved');
        }));
    });

    router.post('/reopenReply', loggedInMiddleware, (req, res) => {
        discussDb.byReplyId(req.body.replyId, handleNotFound({req, res}, comment => {
            replyTo(req, res, comment, undefined, 'active');
        }));
    });

    return router;
}

const ioServerCommentUpdated = (username, roomId) => ioServer.ioServer.of('/comment').to(roomId).emit('commentUpdated', {username});

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
