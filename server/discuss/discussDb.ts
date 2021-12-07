import * as mongoose from 'mongoose';
import { Document, Schema } from 'mongoose';
import { config, ObjectId } from 'server';
import { establishConnection } from 'server/system/connections';
import { addStringtype } from 'server/system/mongoose-stringtype';
import { userRefSchema } from 'server/user/userDb';
import { CbError1, Comment as CommentClient, CommentReply as CommentReplyClient } from 'shared/models.model';

addStringtype(mongoose);
const StringType = (Schema.Types as any).StringType;
const conn = establishConnection(config.database.appData);

const replySchema = {
    created: Date,
    pendingApproval: {type: Boolean, index: true},
    status: {type: StringType, enum: ['active', 'resolved', 'deleted'], default: 'active'},
    text: StringType,
    user: userRefSchema,
};

export const commentSchema = new Schema(Object.assign({
    element: {
        eltId: StringType,
        eltType: {type: StringType, enum: ['cde', 'form', 'board']},
    },
    linkedTab: StringType,
    replies: [replySchema],
}, replySchema), {});

export type CommentReply = Omit<CommentReplyClient, 'user'> & {organizationName: string, user: {_id: ObjectId, username: string}};
export type Comment = Omit<CommentClient, 'replies' | 'user'>
    & {organizationName: string, replies: CommentReply[], user: {_id: ObjectId, username: string}};
export type CommentDocument = Document & Comment;
export const commentModel: mongoose.Model<CommentDocument> = conn.model('Comment', commentSchema);

export function byId(id: string, cb: CbError1<CommentDocument>) {
    commentModel.findById(id, cb);
}

export function byReplyId(id: string, cb: CbError1<CommentDocument>) {
    commentModel.findOne({'replies._id': id}, cb);
}

export function byEltId(id: string, cb: CbError1<CommentDocument[]>) {
    commentModel.aggregate([
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
    ], cb);
}

export function save(comment: Comment, cb: CbError1<CommentDocument>) {
    new commentModel(comment).save(cb);
}

// export function commentsByCriteria(criteria, from, size, cb: CbError<CommentDocument[]>) {
//     commentModel.find(criteria).skip(from).limit(size).sort({created: -1}).exec(cb);
// }

export function orgCommentsByCriteria(criteria: any, myOrgs: string[] | undefined, from: number, size: number,
                                      cb: CbError1<CommentDocument[]>) {
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
    commentModel.aggregate(aggs, cb);
}
