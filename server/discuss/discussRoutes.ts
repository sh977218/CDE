import { Request, RequestHandler, Response, Router } from 'express';
import { BoardDocument } from 'server/board/boardDb';
import {
    byEltId, byId, byReplyId, CommentDocument, CommentReply, numberUnapprovedMessageByUsername, orgCommentsByCriteria, save
} from 'server/discuss/discussDb';
import { handleNotFound, handleError } from 'server/errorHandler/errorHandler';
import { myOrgs } from 'server/orgManagement/orgSvc';
import { createTask, notifyForComment } from 'server/system/adminItemSvc';
import { loggedInMiddleware } from 'server/system/authorization';
import { ioServer } from 'server/system/ioServer';
import { getDao } from 'server/system/moduleDaoManager';
import { createMessage, fetchItem, ItemDocument, Message } from 'server/system/mongo-data';
import { Cb1 } from 'shared/models.model';
import { canComment, canCommentManage } from 'shared/system/authorizationShared';

require('express-async-errors');

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
        const numberUnapprovedMessages = await numberUnapprovedMessageByUsername(req.user.username);
        if (numberUnapprovedMessages >= 5) {
            return res.status(403).send('You have too many unapproved messages.');
        }
        fetchItem<ItemDocument>(eltModule, eltTinyId, handleNotFound(handlerOptions, elt => {
            comment.user = req.user;
            comment.created = new Date().toJSON();
            if (!canComment(req.user, elt)) {
                comment.pendingApproval = true;
            }
            save(comment, handleNotFound(handlerOptions, savedComment => {
                ioServerCommentUpdated(req.user.username, eltTinyId);
                if (savedComment.pendingApproval) {
                    createTask(req.user, 'CommentReviewer', 'approval', eltModule,
                        eltTinyId, 'comment');
                } else {
                    notifyForComment({}, savedComment, eltModule, eltTinyId,
                        elt.stewardOrg && elt.stewardOrg.name, [] as any);
                }
                res.send({});
            }));
        }));
    });

    router.post('/replyComment', loggedInMiddleware, async (req, res) => {
        const handlerOptions = {req, res};
        const numberUnapprovedMessages = await numberUnapprovedMessageByUsername(req.user.username);
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
            fetchItem<ItemDocument | BoardDocument>(eltModule, eltTinyId, handleNotFound({}, elt => {
                if (!canComment(req.user, elt)) {
                    reply.pendingApproval = true;
                }
                comment.replies.push(reply);
                save(comment, handleNotFound(handlerOptions, savedComment => {
                    ioServerCommentUpdated(req.user.username, comment.element.eltId);
                    if (reply.pendingApproval) {
                        createTask(req.user, 'CommentReviewer', 'approval', eltModule,
                            eltTinyId, 'comment');
                    } else {
                        notifyForComment({},
                            savedComment.replies.filter(r => +new Date(r.created) === +new Date(reply.created))[0] as CommentReply,
                            eltModule, eltTinyId,
                            (elt as ItemDocument).stewardOrg && (elt as ItemDocument).stewardOrg.name, [] as any[]);
                    }
                    if (req.user.username !== savedComment.user.username) {
                        const message: Omit<Message, '_id'> = {
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
        }));
    });

    router.post('/deleteComment', loggedInMiddleware, (req, res) => {
        const commentId = req.body.commentId;
        byId(commentId, handleNotFound({req, res}, comment => {
            getCommentItem({req, res}, comment, element => {
                if (!canCommentManage(req.user, element, comment)) {
                    return res.status(403).send('You can only remove ' + element.elementType + 's you own.');
                }
                comment.remove(handleError({req, res}, () => {
                    ioServerCommentUpdated(req.user.username, comment.element.eltId);
                    res.send({});
                }));
            });
        }));
    });

    router.post('/deleteReply', loggedInMiddleware, (req, res) => {
        const replyId = req.body.replyId;
        byReplyId(replyId, handleNotFound({req, res}, comment => {
            getCommentItem({req, res}, comment, element => {
                if (!canCommentManage(req.user, element, comment)) {
                    return res.status(403).send('You can only remove ' + element.elementType + 's you own.');
                }
                comment.replies = comment.replies.filter(r => r._id.toString() !== replyId) as CommentReply[];
                comment.save(handleError<CommentDocument>({req, res}, () => {
                    ioServerCommentUpdated(req.user.username, comment.element.eltId);
                    res.send({});
                }));
            });
        }));
    });

    function respondCommentOrgsByCriteria(req: Request, res: Response, criteria: any) {
        const handlerOptions = {req, res};
        const from = parseInt(req.params.from, 10);
        const size = parseInt(req.params.size, 10);
        const orgName: string | string[] = req.params.orgName;
        orgCommentsByCriteria(
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
        respondCommentOrgsByCriteria(req, res, {'user.username': req.user.username});
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
                comment.replies = comment.replies.filter(r => r._id.toString() !== req.body.replyId) as CommentReply[];
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
        byId(req.body.commentId, handleNotFound<CommentDocument>({req, res}, comment => {
            getCommentItem({req, res}, comment, item => {
                if (!canCommentManage(req.user, item, comment)) {
                    res.status(403).send();
                    return;
                }
                replyTo(req, res, comment, 'resolved');
            });
        }));
    });

    router.post('/reopenComment', loggedInMiddleware, (req, res) => {
        byId(req.body.commentId, handleNotFound<CommentDocument>({req, res}, comment => {
            getCommentItem({req, res}, comment, item => {
                if (!canCommentManage(req.user, item, comment)) {
                    res.status(403).send();
                    return;
                }
                replyTo(req, res, comment, 'active');
            });
        }));
    });

    router.post('/resolveReply', loggedInMiddleware, (req, res) => {
        byReplyId(req.body.replyId, handleNotFound<CommentDocument>({req, res}, comment => {
            getCommentItem({req, res}, comment, item => {
                if (!canCommentManage(req.user, item, comment)) {
                    res.status(403).send();
                    return;
                }
                replyTo(req, res, comment, undefined, 'resolved');
            });
        }));
    });

    router.post('/reopenReply', loggedInMiddleware, (req, res) => {
        byReplyId(req.body.replyId, handleNotFound<CommentDocument>({req, res}, comment => {
            getCommentItem({req, res}, comment, item => {
                if (!canCommentManage(req.user, item, comment)) {
                    res.status(403).send();
                    return;
                }
                replyTo(req, res, comment, undefined, 'active');
            });
        }));
    });

    return router;
}

const ioServerCommentUpdated = (username: string, roomId: string) =>
    ioServer.of('/comment').to(roomId).emit('commentUpdated', {username});

function getCommentItem(handlerOptions: {req: Request, res: Response}, comment: CommentDocument, cb: Cb1<ItemDocument>): void {
    const dao = getDao(comment.element.eltType);
    const idRetrievalFunc = dao.byTinyId ? dao.byTinyId : dao.byId;
    const eltId = comment.element.eltId;
    idRetrievalFunc(eltId, handleNotFound<ItemDocument>(handlerOptions, cb));
}

function replyTo(req: Request, res: Response, comment: CommentDocument, status?: string, repliesStatus?: string, send = {}) {
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
