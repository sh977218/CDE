exports.typeToCriteria = function (type, {org, users} = {org: undefined, users: undefined}) {
    switch (type) {
        case 'approveCommentReviewer':
            return {roles: 'CommentReviewer'};
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

exports.criteriaSet = function (criteria, set, value = true) {
    criteria[set] = value;
    return criteria;
};
