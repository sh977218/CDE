import { ObjectId } from 'server/system/mongo-data';
import { Dictionary } from 'async';

export type NotificationType = 'approvalAttachmentReviewer' | 'approvalCommentReviewer' | 'comment';

export function typeToCriteria(type: NotificationType,
                               {org, users} = {org: undefined, users: []} as {org?: string, users: ObjectId[]}) {
    let result = {findNone: 1} as any;
    switch (type) {
        case 'approvalAttachmentReviewer':
            result = {
                $or: [
                    {siteAdmin: true},
                    {roles: 'AttachmentReviewer'}
                ]
            };
            break;
        case 'approvalCommentReviewer':
            result = {
                $or: [
                    {siteAdmin: true},
                    {roles: 'CommentReviewer'}
                ]
            };
            break;
        case 'comment':
            result = {
                $or: [
                    {_id: {$in: users}},
                    {orgAdmin: org},
                    {orgCurator: org}
                ]
            };
    }
    return result;
}

export function typeToNotificationSetting(type: NotificationType): string {
    return ({
        approvalAttachmentReviewer: 'approvalAttachment',
        approvalCommentReviewer: 'approvalComment',
        comment: 'comment'
    } as Dictionary<string>)[type] || 'noMatch';
}

export function criteriaSet(criteria, set) {
    criteria[set] = true;
    return criteria;
}


