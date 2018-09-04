export const rolesEnum = ['DocumentationEditor', 'BoardPublisher', 'CommentAuthor',
    'CommentReviewer', 'AttachmentReviewer', 'OrgAuthority'];

export function canComment(user) {
    return hasRole(user, 'CommentAuthor') || hasRole(user, 'CommentReviewer') || isOrgCurator(user);
}

export function canEditCuratedItem(user, item) {
    if (!item) return false;
    if (item.archived) return false;
    if (isSiteAdmin(user)) {
        return true;
    }
    if (item.registrationState.registrationStatus === 'Standard' ||
        item.registrationState.registrationStatus === 'Preferred Standard') {
        return false;
    }
    return isOrgCurator(user, item.stewardOrg.name);
}

export function isOrgAuthority(user) {
    return hasRole(user, 'OrgAuthority');
}

export function canRemoveComment(user, comment, element) {
    if (!user || !comment) return false;
    return user.username === comment.user.username
        || element && element.owner && element.owner.username === user.username
        || element && element.stewardOrg && isOrgAdmin(user, element.stewardOrg.name)
        || isSiteAdmin(user);
}

export function hasRole(user, role) {
    if (!user || !role) return false;
    if (isSiteAdmin(user)) return true;
    if (user.roles && user.roles.indexOf(role) > -1) return true;
    return user.orgCurator.length > 0 && role === 'BoardPublisher';
}

export function isOrgCurator(user, org = undefined) {
    if (!user) return false;
    if (isOrgAdmin(user, org)) return true;
    return user.orgCurator && (org
            ? user.orgCurator.indexOf(org) > -1
            : user.orgCurator.length > 0
    );
}

export function isOrgAdmin(user, org = undefined) {
    if (!user) return false;
    if (isOrgAuthority(user)) return true;
    return user.orgAdmin && (org
            ? user.orgAdmin.indexOf(org) > -1
            : user.orgAdmin.length > 0
    );
}

export function isSiteAdmin(user) {
    return user && user.siteAdmin;
}
