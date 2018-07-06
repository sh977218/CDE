const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const config = require('../system/parseConfig');
const connHelper = require('../system/connections');
const conn = connHelper.establishConnection(config.database.appData);

function deleteEmpty(v) {
    if (v === null || v === '') {
        return;
    }
    return v;
}

const stringType = {type: String, set: deleteEmpty};

exports.commentSchema = new Schema({
    text: stringType,
    user: stringType,
    username: stringType,
    userBk: {
        userId: Schema.Types.ObjectId,
        username: stringType
    },
    created: Date,
    pendingApproval: Boolean,
    linkedTab: stringType,
    status: Object.assign({enum: ["active", "resolved", "deleted"], default: "active"}, stringType),
    replies: [{
        text: stringType,
        user: stringType,
        username: stringType,
        userBk: {
            userId: Schema.Types.ObjectId,
            username: stringType
        },
        created: Date,
        pendingApproval: Boolean,
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
    Comment.findOne({'replies.id': id}, callback);
};

exports.save = (comment, callback) => {
    new Comment.save(comment, callback);
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
    Comment.aggregate(
        [{
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

