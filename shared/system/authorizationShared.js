export const rolesEnum = ["DocumentationEditor", "BoardPublisher", "CommentAuthor",
    "CommentReviewer", "AttachmentReviewer", "OrgAuthority", "FormEditor"];

export function canComment(user) {
    return hasRole(user, "CommentAuthor") || hasRole(user, "CommentReviewer") || isOrgCurator(user);
}

export function canCreateForms(user) {
    return hasRole(user, "FormEditor");
}

export function canOrgAuthority(user) {
    return hasRole(user, "OrgAuthority");
}

export function hasRole(user, role) {
    if (!user) return false;
    if (user.siteAdmin) return true;
    if (user.roles && user.roles.indexOf(role) > -1) return true;
}

export function isOrgCurator(user, org = undefined) {
    if (!user) return false;
    if (isOrgAdmin(user, org)) return true;
    if (org) {
        return user.orgCurator && user.orgCurator.indexOf(org) > -1;
    } else {
        return user.orgCurator && user.orgCurator.length > 0;
    }
}

export function isOrgAdmin(user, org = undefined) {
    if (!user) return false;
    if (canOrgAuthority(user)) return true;
    if (org) {
        return user.orgAdmin && user.orgAdmin.indexOf(org) > -1;
    } else {
        return user.orgAdmin && user.orgAdmin.length > 0;
    }
}

export function isSiteAdmin(user) {
    return user && user.siteAdmin;
}