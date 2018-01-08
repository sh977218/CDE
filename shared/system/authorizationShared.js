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

export function isCuratorOf(user, orgName) {
    if (!user) return false;
    if (user.siteAdmin) return true;
    return (user.orgAdmin && user.orgAdmin.indexOf(orgName) >= 0)
        || (user.orgCurator && user.orgCurator.indexOf(orgName) >= 0);
}

export function isOrgCurator(user) {
    if (!user) return false;
    return isOrgAdmin(user) || (user.orgCurator && user.orgCurator.length > 0);
}

export function isOrgAdmin(user) {
    if (!user) return false;
    return user.siteAdmin === true || (user.orgAdmin && user.orgAdmin.length > 0);
}

export function isSiteAdmin(user) {
    return user && user.siteAdmin;
}
