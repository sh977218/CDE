import { capString } from '../../shared/system/util';

export function typeToCriteria(type, {org, users} = {org: undefined, users: undefined}) {
    switch (type) {
        case 'approvalAttachmentReviewer':
            return {
                $or: [
                    {siteAdmin: true},
                    {roles: 'AttachmentReviewer'}
                ]
            };
        case 'approvalCommentReviewer':
            return {
                $or: [
                    {siteAdmin: true},
                    {roles: 'CommentReviewer'}
                ]
            };
        case 'comment':
            return {
                $or: [
                    {_id: {$in: users || []}},
                    {orgAdmin: org},
                    {orgCurator: org}
                ]
            };
        default:
            return {findNone: 1};
    }
}

export function typeToNotificationSetting(type) {
    switch (type) {
        case 'approvalAttachmentReviewer':
            return 'approvalAttachment';
        case 'approvalCommentReviewer':
            return 'approvalComment';
        case 'comment':
            return 'comment';
        default:
            return 'noMatch';
    }
}

export function criteriaSet(criteria, set, value = true) {
    criteria[set] = value;
    return criteria;
}
