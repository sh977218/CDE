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

type CommentDocument = Comment & {organizationName: string} & mongoose.Document;
export const Comment: mongoose.Model<CommentDocument> = conn.model('Comment', commentSchema);

export function byId(id, cb) {
    Comment.findById(id, cb);
}

export function byReplyId(id, cb) {
    Comment.findOne({'replies._id': id}, cb);
}

export function byEltId(id, cb) {
    const aggregate = [
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

// export function commentsByCriteria(criteria, from, size, cb: CbError<CommentDocument[]>) {
//     Comment.find(criteria).skip(from).limit(size).sort({created: -1}).exec(cb);
// }

export function orgCommentsByCriteria(criteria: any, myOrgs: string[] | undefined, from: number, size: number, cb: CbError<CommentDocument[]>) {
    let aggs: any[] = [
        {$match: criteria},
        {
            $lookup: {
                from: 'dataelements',
                localField: 'element.eltId',
                foreignField: 'tinyId',
                as: 'embeddedCde'
            }
        },
        {
            $lookup: {
                from: 'forms',
                localField: 'element.eltId',
                foreignField: 'tinyId',
                as: 'embeddedForm'
            }
        }
    ];
    if (myOrgs) {
        aggs.push({
            $match: {
                $or: [
                    {'embeddedCde.stewardOrg.name': {$in: myOrgs}},
                    {'embeddedForm.stewardOrg.name': {$in: myOrgs}},
                    {'embeddedCde.classification.stewardOrg.name': {$in: myOrgs}},
                    {'embeddedForm.classification.stewardOrg.name': {$in: myOrgs}}
                ]
            }
        });
    }
    aggs = aggs.concat([
        {
            $unwind: {
                path: '$embeddedCde',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$embeddedForm',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                organizationName: {
                    $cond: {
                        if: '$embeddedCde.stewardOrg.name',
                        then: '$embeddedCde.stewardOrg.name',
                        else: '$embeddedForm.stewardOrg.name'
                    }
                },
            }
        },
        {
            $project: {
                embeddedCde: 0,
                embeddedForm: 0,
            }
        },
        {$sort: {created: -1}},
        {$skip: from}
    ]);
    if (size > 0) {
        aggs.push({$limit: size});
    }
    Comment.aggregate(aggs, cb);
}

export function unapproved() {
    return Comment.find({$or: [{pendingApproval: true}, {'replies.pendingApproval': true}]});
}

export function numberUnapprovedMessageByUsername(username) {
    return Comment.countDocuments({
        $or: [{'user.username': username, pendingApproval: true},
            {'replies.user.username': username, 'replies.pendingApproval': true}]
    });
}
