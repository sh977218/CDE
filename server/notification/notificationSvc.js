exports.typeToCriteria = function (type, {org, users} = {org: undefined, users: undefined}) {
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
};

exports.typeToNotificationSetting = function (type) {
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
};

exports.criteriaSet = function (criteria, set, value = true) {
    criteria[set] = value;
    return criteria;
};
