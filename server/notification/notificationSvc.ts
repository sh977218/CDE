export function typeToCriteria(type, {org, users} = {org: undefined, users: []}) {
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

export function typeToNotificationSetting(type) {
    return {
        approvalAttachmentReviewer: 'approvalAttachment',
        approvalCommentReviewer: 'approvalComment',
        comment: 'comment'
    }[type] || 'noMatch';
}

export function criteriaSet(criteria, set) {
    criteria[set] = true;
    return criteria;
}


