import _find from 'lodash/find';

/*
Bit Value	1	1	1	1	1	1	1	1
Position	7	6	5	4	3	2	1	0
*/
export const ROLE_BIT_MAP = {
    "DocumentationEditor": 1,
    "BoardPublisher": 2,
    "CommentAuthor": 3,
    "CommentReviewer": 4,
    "AttachmentReviewer": 5,
    "OrgAuthority": 6,
    "FormEditor": 7
};


export const rolesEnum = ["DocumentationEditor", "BoardPublisher", "CommentAuthor",
    "CommentReviewer", "AttachmentReviewer", "OrgAuthority", "FormEditor"];

export function canComment(user) {
    return hasRole(user, "CommentAuthor") || hasRole(user, "CommentReviewer") || isOrgCurator(user);
}

export function canCreateForms(user) {
    return hasRole(user, "FormEditor");
}

export function canEditCuratedItem(user, item) {
    if (!item) return false;
    if (item.archived) return false;
    if (isSiteAdmin(user)) {
        return true;
    }
    if (item.registrationState.registrationStatus === "Standard" ||
        item.registrationState.registrationStatus === "Preferred Standard") {
        return false;
    }
    return isOrgCurator(user, item.stewardOrg.name);
}

export function canOrgAuthority(user) {
    return hasRole(user, "OrgAuthority");
}

export function hasRole(user, role) {
    if (!user) return false;
    if (isSiteAdmin(user)) return true;
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
