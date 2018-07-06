const authorization = require('../system/authorization');
const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');
const dbLogger = require('../log/dbLogger');
const mongo_cde = require('../cde/mongo-cde');
const mongo_form = require('../form/mongo-form');
const mongo_board = require('../board/mongo-board');
const discussDb = require('./discussDb');
const daoManager = require('../system/moduleDaoManager');
const ioServer = require("../system/ioServer");

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.post('/postComment', authorization.loggedInMiddleware, (req, res) => {
        let comment = req.body;
        let dao = daoManager.getDao(req.comment.element.eltType);
        let idRetrievalFunc = dao.byTinyId ? dao.byTinyId : dao.byId;
        idRetrievalFunc(req.body.element.eltId, handleError({
                res,
                origin: "/postComment/"
            }, elt => {
                if (!elt) return res.status(404).send("Element does not exist.");
                comment.user = req.user;
                comment.created = new Date().toJSON();
                if (!authorizationShared.canComment(req.user)) {
                    comment.pendingApproval = true;
                }
                discussDb.save(handleError({
                    res,
                    origin: "/postComment/"
                }, savedComment => {
                    let message = "Comment added.";
                    ioServerCommentUpdated(req.user.username);
                    if (savedComment.pendingApproval) {
                        message += " Approval required.";
                        let details = {
                            element: {
                                eltId: savedComment.element.eltId,
                                name: dao.getPrimaryName(elt),
                                eltType: dao.type
                            },
                            comment: {
                                commentId: savedComment._id,
                                text: savedComment.text
                            }
                        };
                        exports.createApprovalMessage(req.user, "CommentReviewer", "CommentApproval", details);
                    }
                    res.send({message: message});
                }));
            })
        );

    });

    router.post('/replyComment', [authorization.isAuthenticatedMiddleware], (req, res) => {
        discussDb.byId(req.body.commentId, handleError({
            res,
            origin: "/replyComment/"
        }, comment => {
            if (!comment) return res.status(404).send("Comment not found.");
            if (!comment.replies) comment.replies = [];
            let reply = {
                user: req.user,
                created: new Date().toJSON(),
                text: req.body.reply
            };
            if (!authorizationShared.canComment(req.user)) {
                reply.pendingApproval = true;
            }
            comment.replies.push(reply);
            discussDb.save(handleError({
                res,
                origin: "/replyComment/"
            }, savedComment => {
                ioServerCommentUpdated(req.user.username);
                res.send({message: "Reply added"});
                if (reply.pendingApproval) {
                    let details = {
                        element: {
                            tinyId: comment.element.eltId,
                            name: req.body.eltName
                        },
                        comment: {
                            commentId: comment._id,
                            replyIndex: comment.replies.length,
                            text: req.body.reply
                        }
                    };
                    exports.createApprovalMessage(req.user, "CommentReviewer", "CommentApproval", details);
                }
                if (req.user.username !== savedComment.user.username) {
                    let message = {
                        recipient: {recipientType: "user", name: savedComment.user.username},
                        author: {authorType: "user", name: req.user.username},
                        date: new Date(),
                        type: "CommentReply",
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
                    mongo_data_system.createMessage(message);
                }
            }));
        }))
    });

    router.post('/deleteComment', [authorization.isAuthenticatedMiddleware], (req, res) => {
        let commentId = req.body.commentId;
        discussDb.byId(commentId, handleError({
                res,
                origin: "/deleteComment/"
            }, comment => {
                if (!comment) return res.status(404).send("Comment not found");
                let dao = daoManager.getDao(comment.element.eltType);
                let idRetrievalFunc = dao.byTinyId ? dao.byTinyId : dao.byId;
                let eltId = comment.element.eltId;
                idRetrievalFunc(eltId, handleError({
                        res,
                        origin: "/deleteComment/"
                    }, element => {
                        if (!comment) return res.status(404).send('Element not found');
                        if (!authorizationShared.canRemoveComment(req.user, comment, element)) {
                            return res.send({message: "You can only remove " + element.type + " you own."});
                        }
                        comment.remove(handleError({
                                res,
                                origin: "/deleteComment/"
                            }, () => {
                                ioServerCommentUpdated(req.user.username);
                                res.send({message: "Comment removed"});
                            })
                        );
                    })
                )

            })
        )
    });

    router.post('/deleteReply', [authorization.isAuthenticatedMiddleware], (req, res) => {
        let replyId = req.body.replyId;
        discussDb.byReplyId(replyId, handleError({
                res,
                origin: "/deleteReply/"
            }, comment => {
                if (!comment) return res.status(404).send("Reply not found");
                let dao = daoManager.getDao(comment.element.eltType);
                let idRetrievalFunc = dao.byTinyId ? dao.byTinyId : dao.byId;
                let eltId = comment.element.eltId;
                idRetrievalFunc(eltId, handleError({
                        res,
                        origin: "/deleteReply/"
                    }, element => {
                        if (!comment) return res.status(404).send('Element not found');
                        if (!authorizationShared.canRemoveComment(req.user, comment, element)) {
                            return res.send({message: "You can only remove " + element.type + " you own."});
                        }
                        comment.replies = comment.replies.filter(r => r._id !== replyId);
                        comment.save(handleError({
                                res,
                                origin: "/deleteComment/"
                            }, () => {
                                ioServerCommentUpdated(req.user.username);
                                res.send({message: "Reply removed"});
                            })
                        );
                    })
                )

            })
        )
    });

    router.get('/commentsFor/:username/:from/:size', (req, res) => {
        let from = Number.parseInt(from);
        let size = Number.parseInt(size);
        if (from < 0 || size < 0) return res.status(422).send();
        discussDb.commentsForUser(req.params.username, from, size, handleError({
                res,
                origin: "/commentsFor/"
            }, comments => res.send(comments))
        )
    });


    
    return router;

};

ioServerCommentUpdated = username => ioServer.ioServer.of("/comment").emit('commentUpdated', {username: username});