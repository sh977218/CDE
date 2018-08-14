const authorization = require('../system/authorization');
const authorizationShared = require('@std/esm')(module)('../../shared/system/authorizationShared');
const handleError = require('../log/dbLogger').handleError;
const discussDb = require('./discussDb');
const daoManager = require('../system/moduleDaoManager');
const ioServer = require("../system/ioServer");
const userService = require("../system/usersrvc");
const mongo_data = require('../system/mongo-data');
const adminItemService = require('../system/adminItemSvc');

exports.module = function (roleConfig) {
    const router = require('express').Router();

    router.get('/comments/eltId/:eltId', (req, res) => {
        discussDb.byEltId(req.params.eltId, handleError({req, res}, comments => {
            comments.forEach(c => {
                if (c.pendingApproval) c.text = "This comment is pending approval";
                c.replies.forEach(r => {
                    if (r.pendingApproval) r.text = "This reply is pending approval";
                });
            });
            res.send(comments);
        }))
    });

    router.post('/postComment', authorization.loggedInMiddleware, async (req, res) => {
        let comment = req.body;
        let numberUnapprovedMessages = await discussDb.numberUnapprovedMessageByUsername(req.user.username)
            .catch(handleError({req, res}));
        if (numberUnapprovedMessages >= 5) return res.status(403).send('You have too many unapproved messages.');
        let dao = daoManager.getDao(comment.element.eltType);
        let idRetrievalFunc = dao.byTinyId ? dao.byTinyId : dao.byId;
        idRetrievalFunc(comment.element.eltId, handleError({req, res}, elt => {
                if (!elt) return res.status(404).send("Element does not exist.");
                comment.user = req.user;
                comment.created = new Date().toJSON();
                if (!authorizationShared.canComment(req.user)) comment.pendingApproval = true;
                discussDb.save(comment, handleError({req, res}, savedComment => {
                    ioServerCommentUpdated(req.user.username);
                    if (savedComment.pendingApproval) {
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
                        adminItemService.createApprovalMessage(req.user, "CommentReviewer", "CommentApproval", details);
                    }
                    res.send({});
                }));
            })
        );

    });
    router.post('/replyComment', authorization.isAuthenticatedMiddleware, async (req, res) => {
        let numberUnapprovedMessages = await discussDb.numberUnapprovedMessageByUsername(req.user.username)
            .catch(handleError({req, res}));
        if (numberUnapprovedMessages >= 5) return res.status(403).send('You have too many unapproved messages.');
        discussDb.byId(req.body.commentId, handleError({req, res}, comment => {
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
            discussDb.save(comment, handleError({req, res}, savedComment => {
                ioServerCommentUpdated(req.user.username);
                res.send({});
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
                    adminItemService.createApprovalMessage(req.user, "CommentReviewer", "CommentApproval", details);
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
                    mongo_data.createMessage(message);
                }
            }));
        }))
    });

    router.post('/deleteComment', [authorization.isAuthenticatedMiddleware], (req, res) => {
        let commentId = req.body.commentId;
        discussDb.byId(commentId, handleError({req, res}, comment => {
                if (!comment) return res.status(404).send("Comment not found");
                let dao = daoManager.getDao(comment.element.eltType);
                let idRetrievalFunc = dao.byTinyId ? dao.byTinyId : dao.byId;
                let eltId = comment.element.eltId;
                idRetrievalFunc(eltId, handleError({req, res}, element => {
                        if (!comment) return res.status(404).send('Element not found');
                        if (!authorizationShared.canRemoveComment(req.user, comment, element)) {
                            return res.status(401).send("You can only remove " + element.type + " you own.");
                        }
                        comment.remove(handleError({req, res}, () => {
                                ioServerCommentUpdated(req.user.username);
                                res.send({});
                            })
                        );
                    })
                )

            })
        )
    });
    router.post('/deleteReply', [authorization.isAuthenticatedMiddleware], (req, res) => {
        let replyId = req.body.replyId;
        discussDb.byReplyId(replyId, handleError({req, res}, comment => {
                if (!comment) return res.status(404).send("Reply not found");
                let dao = daoManager.getDao(comment.element.eltType);
                let idRetrievalFunc = dao.byTinyId ? dao.byTinyId : dao.byId;
                let eltId = comment.element.eltId;
                idRetrievalFunc(eltId, handleError({req, res}, element => {
                        if (!element) return res.status(404).send('Element not found');
                        if (!authorizationShared.canRemoveComment(req.user, comment, element)) {
                            return res.status(401).send("You can only remove " + element.type + " you own.");
                        }
                        comment.replies = comment.replies.filter(r => r._id.toString() !== replyId);
                        comment.save(handleError({req, res}, () => {
                                ioServerCommentUpdated(req.user.username);
                                res.send({});
                            })
                        );
                    })
                )

            })
        )
    });

    router.get('/commentsFor/:username/:from/:size', [authorization.isAuthenticatedMiddleware], (req, res) => {
        let from = Number.parseInt(req.params.from);
        let size = Number.parseInt(req.params.size);
        let username = req.params.username;
        if (!username || from < 0 || size < 0) return res.status(422).send();
        discussDb.commentsForUser(username, from, size, handleError({req, res}, comments =>
            res.send(comments))
        )
    });
    router.get('/allComments/:from/:size', roleConfig.allComments, (req, res) => {
        let from = Number.parseInt(req.params.from);
        let size = Number.parseInt(req.params.size);
        if (from < 0 || size < 0) return res.status(422).send();
        discussDb.allComments(from, size, handleError({req, res}, comments => res.send(comments)))
    });
    router.get('/orgComments/:from/:size', authorization.loggedInMiddleware, (req, res) => {
        let myOrgs = userService.myOrgs(req.user);
        if (!myOrgs || myOrgs.length === 0) return res.send([]);
        let from = Number.parseInt(req.params.from);
        let size = Number.parseInt(req.params.size);
        if (from < 0 || size < 0) return res.status(422).send();
        discussDb.orgComments(myOrgs, from, size, handleError({req, res}, comments =>
            res.send(comments))
        )
    });

    router.post('/approveComment', roleConfig.manageComment, (req, res) => {
        discussDb.byId(req.body.commentId, handleError({req, res}, comment => {
                if (!comment) return res.status(404).send();
                comment.pendingApproval = false;
                comment.save(handleError({req, res}, () => res.send("Approved")));
            })
        )
    });
    router.post('/declineComment', roleConfig.manageComment, (req, res) => {
        discussDb.byId(req.body.commentId, handleError({req, res}, comment => {
                if (!comment) return res.status(404).send();
                comment.pendingApproval = false;
                comment.remove(handleError({req, res}, () => res.send("Declined")));
            })
        )
    });

    router.post('/approveReply', roleConfig.manageComment, (req, res) => {
        let replyId = req.body.replyId;
        discussDb.byReplyId(replyId, handleError({req, res}, comment => {
                if (!comment) return res.status(404).send();
                comment.replies.forEach(r => {
                    if (r._id.toString() === replyId) r.pendingApproval = false;
                });
                comment.save(handleError({req, res}, () => res.send("Approved")));
            })
        )
    });
    router.post('/declineReply', roleConfig.manageComment, (req, res) => {
        let replyId = req.body.replyId;
        discussDb.byReplyId(replyId, handleError({req, res}, comment => {
                if (!comment) return res.status(404).send();
                comment.replies = comment.replies.filter(r => r._id.toString() !== replyId);
                comment.save(handleError({req, res}, () => res.send("Approved")));
            })
        )
    });

    router.post('/resolveComment', [authorization.isAuthenticatedMiddleware], (req, res) => {
        discussDb.byId(req.body.commentId, handleError({req, res}, comment => {
                if (!comment) return res.status(404).send();
                comment.status = 'resolved';
                comment.save(handleError({req, res}, () => {
                    ioServerCommentUpdated(req.user.username);
                    res.send({});
                }));
            })
        )
    });
    router.post('/reopenComment', [authorization.isAuthenticatedMiddleware], (req, res) => {
        discussDb.byId(req.body.commentId, handleError({req, res}, comment => {
                if (!comment) return res.status(404).send();
                comment.status = 'active';
                comment.save(handleError({req, res}, () => {
                    ioServerCommentUpdated(req.user.username);
                    res.send({});
                }));
            })
        )
    });

    router.post('/resolveReply', [authorization.isAuthenticatedMiddleware], (req, res) => {
        let replyId = req.body.replyId;
        discussDb.byReplyId(replyId, handleError({req, res}, comment => {
                if (!comment) return res.status(404).send();
                comment.replies.forEach(r => {
                    if (r._id.toString() === replyId) r.status = 'resolved';
                });
                comment.save(handleError({req, res}, () => {
                    ioServerCommentUpdated(req.user.username);
                    res.send({});
                }));
            })
        )
    });
    router.post('/reopenReply', [authorization.isAuthenticatedMiddleware], (req, res) => {
        let replyId = req.body.replyId;
        discussDb.byReplyId(replyId, handleError({req, res}, comment => {
                if (!comment) return res.status(404).send();
                comment.replies.forEach(r => {
                    if (r._id.toString() === replyId) r.status = 'active';
                });
                comment.save(handleError({req, res}, () => {
                    ioServerCommentUpdated(req.user.username);
                    res.send({});
                }));
            })
        )
    });

    return router;

};

// @TODO emit should have room Id.
ioServerCommentUpdated = username => ioServer.ioServer.of("/comment").emit('commentUpdated', {username: username});