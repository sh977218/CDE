export const rolesEnum = ["DocumentationEditor", "BoardPublisher", "CommentAuthor",
    "CommentReviewer", "AttachmentReviewer", "OrgAuthority", "FormEditor"];

export const canComment = function(user) {
    return hasRole(user, "CommentAuthor") || hasRole(user, "CommentReviewer") || isOrgCurator(user);
};

export const canCreateForms = function (user) {
    return hasRole(user, "FormEditor");
};

export const canOrgAuthority = function (user) {
    return hasRole(user, "OrgAuthority");
};

export const hasRole = function(user, role) {
    if (!user) return false;
    if (user.siteAdmin) return true;
    if (user.roles && user.roles.indexOf(role) > -1) return true;
};

export const isCuratorOf = function(user, orgName) {
    if (!user) return false;
    if (user.siteAdmin) return true;
    return (user.orgAdmin && user.orgAdmin.indexOf(orgName) >= 0)
        || (user.orgCurator && user.orgCurator.indexOf(orgName) >= 0);
};

export const isOrgCurator = function(user) {
    if (!user) return false;
    return isOrgAdmin(user) || (user.orgCurator && user.orgCurator.length > 0);
};

export const isOrgAdmin = function(user) {
    if (!user) return false;
    return user.siteAdmin === true || (user.orgAdmin && user.orgAdmin.length > 0);
};

export const isSiteAdmin = function (user) {
    return user && user.siteAdmin;
};
