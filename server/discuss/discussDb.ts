import * as mongoose from 'mongoose';
import { addStringtype } from '../system/mongoose-stringtype';
import { config } from '../system/parseConfig';
import { CbError } from 'shared/models.model';

addStringtype(mongoose);
const Schema = mongoose.Schema;
const StringType = (Schema.Types as any).StringType;

const _ = require('lodash');
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

export const commentSchema = new Schema(Object.assign({
    element: {
        eltId: StringType,
        eltType: {type: StringType, enum: ['cde', 'form', 'board']},
    },
    linkedTab: StringType,
    replies: [replySchema],
}, replySchema), {usePushEach: true});

export const Comment = conn.model('Comment', commentSchema);

export function byId(id, cb) {
    Comment.findById(id, cb);
}

export function byReplyId(id, cb) {
    Comment.findOne({'replies._id': id}, cb);
}

export function byEltId(id, cb) {
    let aggregate = [
        {$match: {'element.eltId': id}},
        {
            $lookup: {
                from: 'users',
                let: {username: '$username'},
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
}

export function save(comment, cb) {
    new Comment(comment).save(cb);
}

export function commentsForUser(username, from, size, cb) {
    Comment.find({username: username}).skip(from).limit(size).sort({created: -1}).exec(cb);
}

export function allComments(from, size, cb) {
    Comment.find().skip(from).limit(size).sort({created: -1}).exec(cb);
}

export function orgComments(myOrgs, from, size, cb) {
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
        }, {
            $project: {
                embeddedCde: 0,
                embeddedForm: 0
            }
        }, {$sort: {created: -1}}, {$skip: from}, {$limit: size}], cb);
}

export function unapproved(cb: CbError<Comment[]>) {
    let query = Comment.find({$or: [{pendingApproval: true}, {'replies.pendingApproval': true}]});
    if (cb) query.exec(cb);
    else return query.exec();
}

export function numberUnapprovedMessageByUsername(username, cb = _.noop()) {
    return Comment.countDocuments({
        $or: [{'user.username': username, pendingApproval: true},
            {'replies.user.username': username, 'replies.pendingApproval': true}]
    }, cb);
}
