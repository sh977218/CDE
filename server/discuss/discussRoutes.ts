import { Request, RequestHandler, Response, Router } from 'express';
import { ObjectId } from 'server';
import { BoardDocument } from 'server/board/boardDb';
import {
    byEltId, byId, byReplyId, CommentDocument, CommentReply, orgCommentsByCriteria, save
} from 'server/discuss/discussDb';
import { handleNotFound, handleError } from 'server/errorHandler/errorHandler';
import { myOrgs } from 'server/orgManagement/orgSvc';
import { notifyForComment } from 'server/system/adminItemSvc';
import { ioServer } from 'server/system/ioServer';
import { getDao } from 'server/system/moduleDaoManager';
import { createMessage, fetchItem, ItemDocument, Message } from 'server/system/mongo-data';
import { Cb1, Item, ModuleAll } from 'shared/models.model';

require('express-async-errors');

export function module(roleConfig: { allComments: RequestHandler, canSeeComment: RequestHandler, }) {
    const router = Router();

    router.get('/comments/eltId/:eltId', roleConfig.canSeeComment, (req, res) => {
        byEltId(req.params.eltId, handleNotFound({req, res}, comments => {
            res.send(comments);
        }));
    });

    router.post('/postComment', roleConfig.canSeeComment, async (req, res) => {
        const handlerOptions = {req, res};
        const comment = req.body;
        const eltModule: ModuleAll = comment.element && comment.element.eltType;
        const eltTinyId: string = comment.element && comment.element.eltId;
        fetchItem(eltModule, eltTinyId, handleNotFound(handlerOptions, elt => {
            comment.user = req.user;
            comment.created = new Date().toJSON();
            save(comment, handleNotFound(handlerOptions, savedComment => {
                ioServerCommentUpdated(req.user.username, eltTinyId);
                notifyForComment({}, savedComment, eltModule, eltTinyId,
                    (elt as Item).stewardOrg && (elt as Item).stewardOrg.name, [] as ObjectId[]);
                res.send({});
            }));
        }));
    });

    router.post('/replyComment', roleConfig.canSeeComment, async (req, res) => {
        const handlerOptions = {req, res};
        byId(req.body.commentId, handleNotFound(handlerOptions, comment => {
            const eltModule = comment.element.eltType;
            const eltTinyId = comment.element.eltId;
            const reply: any = {
                user: req.user,
                created: new Date().toJSON(),
                text: req.body.reply
            };
            fetchItem(eltModule, eltTinyId, handleNotFound({}, elt => {
                comment.replies.push(reply);
                save(comment, handleNotFound(handlerOptions, savedComment => {
                    ioServerCommentUpdated(req.user.username, comment.element.eltId);
                    notifyForComment({},
                        savedComment.replies.filter(r => +new Date(r.created) === +new Date(reply.created))[0] as CommentReply,
                        eltModule, eltTinyId,
                        (elt as ItemDocument).stewardOrg && (elt as ItemDocument).stewardOrg.name, [] as ObjectId[]);
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

    router.post('/deleteComment', roleConfig.canSeeComment, (req, res) => {
        const commentId = req.body.commentId;
        byId(commentId, handleNotFound({req, res}, comment => {
            getCommentItem({req, res}, comment, element => {
                comment.remove(handleError({req, res}, () => {
                    ioServerCommentUpdated(req.user.username, comment.element.eltId);
                    res.send({});
                }));
            });
        }));
    });

    router.post('/deleteReply', roleConfig.canSeeComment, (req, res) => {
        const replyId = req.body.replyId;
        byReplyId(replyId, handleNotFound({req, res}, comment => {
            getCommentItem({req, res}, comment, element => {
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

    router.get('/myComments/:from/:size/:orgName?', roleConfig.canSeeComment, (req: Request, res: Response) => {
        respondCommentOrgsByCriteria(req, res, {'user.username': req.user.username});
    });

    router.get('/orgComments/:from/:size/:orgName?', roleConfig.canSeeComment, (req: Request, res: Response) => {
        if (!req.params.orgName) {
            req.params.orgName = myOrgs(req.user)[0];
        }
        respondCommentOrgsByCriteria(req, res, {});
    });

    router.post('/resolveComment', roleConfig.canSeeComment, (req, res) => {
        byId(req.body.commentId, handleNotFound<CommentDocument>({req, res}, comment => {
            getCommentItem({req, res}, comment, item => {
                replyTo(req, res, comment, 'resolved');
            });
        }));
    });

    router.post('/reopenComment', roleConfig.canSeeComment, (req, res) => {
        byId(req.body.commentId, handleNotFound<CommentDocument>({req, res}, comment => {
            getCommentItem({req, res}, comment, item => {
                replyTo(req, res, comment, 'active');
            });
        }));
    });

    router.post('/resolveReply', roleConfig.canSeeComment, (req, res) => {
        byReplyId(req.body.replyId, handleNotFound<CommentDocument>({req, res}, comment => {
            getCommentItem({req, res}, comment, item => {
                replyTo(req, res, comment, undefined, 'resolved');
            });
        }));
    });

    router.post('/reopenReply', roleConfig.canSeeComment, (req, res) => {
        byReplyId(req.body.replyId, handleNotFound<CommentDocument>({req, res}, comment => {
            getCommentItem({req, res}, comment, item => {
                replyTo(req, res, comment, undefined, 'active');
            });
        }));
    });

    return router;
}

const ioServerCommentUpdated = (username: string, roomId: string) =>
    ioServer.of('/comment').to(roomId).emit('commentUpdated', {username});

function getCommentItem(handlerOptions: { req: Request, res: Response },
                        comment: CommentDocument,
                        cb: Cb1<ItemDocument | BoardDocument>
): void {
    const idRetrievalFunc = getDao(comment.element.eltType).byKey;
    const eltId = comment.element.eltId;
    idRetrievalFunc(eltId, handleNotFound(handlerOptions, cb));
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
