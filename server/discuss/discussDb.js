const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stringType = require('../system/schemas').stringType;
const stringIndexType = require('../system/schemas').stringIndexType;
const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

exports.commentSchema = new Schema({
    text: stringType,
    user: {
        userId: Schema.Types.ObjectId,
        username: stringIndexType
    },
    created: Date,
    pendingApproval: {type: Boolean, index: true},
    linkedTab: stringType,
    status: Object.assign({enum: ["active", "resolved", "deleted"], default: "active"}, stringType),
    replies: [{
        text: stringType,
        user: {
            userId: Schema.Types.ObjectId,
            username: stringIndexType
        },
        created: Date,
        pendingApproval: {type: Boolean, index: true},
        status: Object.assign({enum: ["active", "resolved", "deleted"], default: "active"}, stringType)
    }],
    element: {
        eltType: Object.assign({enum: ["cde", "form", "board"]}, stringType),
        eltId: stringType
    }
}, {usePushEach: true,});

const Comment = conn.model('Comment', exports.commentSchema);
exports.Comment = Comment;

exports.byId = (id, callback) => {
    Comment.findById(id, callback);
};
exports.byReplyId = (id, callback) => {
    Comment.findOne({'replies._id': id}, callback);
};
exports.byEltId = (id, callback) => {
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
        {$replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ['$__user', 0]}, "$$ROOT"]}}},
        {$project: {__user: 0}}
    ];
    Comment.aggregate(aggregate, callback);
};

exports.save = (comment, callback) => {
    new Comment(comment).save(callback);
};

exports.removeById = (id, callback) => {
    Comment.findByIdAndRemove(id, callback);
};

exports.commentsForUser = (username, from, size, callback) => {
    Comment.find({username: username}).skip(from).limit(size).sort({created: -1}).exec(callback);
};
exports.allComments = (from, size, callback) => {
    Comment.find().skip(from).limit(size).sort({created: -1}).exec(callback);
};
exports.orgComments = (myOrgs, from, size, callback) => {
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
        }, {$sort: {created: -1}}, {$skip: from}, {$limit: size}], callback);
};

exports.numberUnapprovedMessageByUsername = username => {
    return Comment.count({
        $or: [{'user.username': username, pendingApproval: true},
            {'replies.user.username': username, pendingApproval: true}]
    }).exec();
};

