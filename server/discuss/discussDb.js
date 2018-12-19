const _ = require('lodash');
const mongoose = require('mongoose');
require('../system/mongoose-stringtype')(mongoose);
const Schema = mongoose.Schema;
const StringType = Schema.Types.StringType;
const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);
const userDb = require('../user/userDb');

const replySchema = {
    created: Date,
    pendingApproval: {type: Boolean, index: true},
    status: {type: StringType, enum: ['active', 'resolved', 'deleted'], default: 'active'},
    text: StringType,
    user: userDb.userRefSchema,
};

exports.commentSchema = new Schema(Object.assign({
    element: {
        eltId: StringType,
        eltType: {type: StringType, enum: ['cde', 'form', 'board']},
    },
    linkedTab: StringType,
    replies: [replySchema],
}, replySchema), {usePushEach: true,});

const Comment = conn.model('Comment', exports.commentSchema);
exports.Comment = Comment;

exports.byId = (id, cb) => {
    Comment.findById(id, cb);
};
exports.byReplyId = (id, cb) => {
    Comment.findOne({'replies._id': id}, cb);
};
exports.byEltId = (id, cb) => {
    let aggregate = [
        {$match: {'element.eltId': id}},
        {
            $lookup: {
                from: 'users',
                let: {'username': '$username'},
                pipeline: [
                    {$match: {$expr: {$eq: ['$username', '$$username']}}},
                    {$project: {_id: 0, avatarUrl: 1}}
                ],
                as: '__user'
            }
        },
        {$replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ['$__user', 0]}, '$$ROOT']}}},
        {$project: {__user: 0}}
    ];
    Comment.aggregate(aggregate, cb);
};

exports.save = (comment, cb) => {
    new Comment(comment).save(cb);
};

exports.removeById = (id, cb) => {
    Comment.findByIdAndRemove(id, cb);
};

exports.commentsForUser = (username, from, size, cb) => {
    Comment.find({username: username}).skip(from).limit(size).sort({created: -1}).exec(cb);
};
exports.allComments = (from, size, cb) => {
    Comment.find().skip(from).limit(size).sort({created: -1}).exec(cb);
};
exports.orgComments = (myOrgs, from, size, cb) => {
    Comment.aggregate([
        {
            $lookup: {
                from: 'dataelements',
                localField: 'element.eltId',
                foreignField: 'tinyId',
                as: 'embeddedCde'
            }
        }, {
            $lookup: {
                from: 'forms',
                localField: 'element.eltId',
                foreignField: 'tinyId',
                as: 'embeddedForm'
            }
        }, {
            $match: {
                $or: [
                    {'embeddedCde.stewardOrg.name': {$in: myOrgs}},
                    {'embeddedForm.stewardOrg.name': {$in: myOrgs}},
                    {'embeddedCde.classification.stewardOrg.name': {$in: myOrgs}},
                    {'embeddedForm.classification.stewardOrg.name': {$in: myOrgs}}
                ]
            }
        }, {$sort: {created: -1}}, {$skip: from}, {$limit: size}], cb);
};

// cb(err comments)
exports.unapproved = cb => {
    Comment.find({$or: [{pendingApproval: true}, {'replies.pendingApproval': true}]}, cb);
};

exports.numberUnapprovedMessageByUsername = (username, cb = _.noop()) => {
    return Comment.count({
        $or: [{'user.username': username, pendingApproval: true},
            {'replies.user.username': username, 'replies.pendingApproval': true}]
    }, cb);
};
