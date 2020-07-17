import { Dictionary } from 'async';
import { ObjectId } from 'server';

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

export function criteriaSet(criteria: any, set: string) {
    criteria[set] = true;
    return criteria;
}


