import { Board, Comment, Item, User } from 'shared/models.model';
import { uniq } from 'lodash';

export type UserRoles = 'DocumentationEditor' | 'BoardPublisher' | 'CommentAuthor' |
    'CommentReviewer' | 'AttachmentReviewer' | 'OrgAuthority';

export const rolesEnum: string[] = ['DocumentationEditor', 'BoardPublisher', 'CommentAuthor',
    'CommentReviewer', 'AttachmentReviewer', 'OrgAuthority'];

export function canComment(user?: User): boolean {
    return hasRole(user, 'CommentAuthor') || hasRole(user, 'CommentReviewer') || isOrgCurator(user);
}

export function canEditCuratedItem(user?: User, item?: Item): boolean {
    if (!item || item.archived || !item.registrationState) {
        return false;
    }
    if (isOrgAuthority(user)) {
        return true;
    }
    if (item.registrationState.registrationStatus === 'Standard' ||
        item.registrationState.registrationStatus === 'Preferred Standard') {
        return false;
    }
    return isOrgCurator(user, item.stewardOrg.name);
}

export function isOrgAuthority(user?: User): boolean {
    return hasRole(user, 'OrgAuthority');
}

export function canRemoveComment(user?: User, comment?: Comment, element?: Board | Item): boolean {
    if (!user || !comment) {
        return false;
    }
    return user.username === comment.user.username
        || element && (element as Board).owner && (element as Board).owner.username === user.username
        || element && (element as Item).stewardOrg && isOrgAdmin(user, (element as Item).stewardOrg.name)
        || isSiteAdmin(user);
}

export function addRole(user: User, role: string) {
    if (!hasRole(user, role)) {
        if (!user.roles) {
            user.roles = [];
        }
        user.roles.push(role);
    }
}

export function hasRole(user?: User, role?: string): boolean {
    if (!user || !role) {
        return false;
    }
    if (isSiteAdmin(user)) {
        return true;
    }
    if (user.roles && user.roles.indexOf(role) > -1) {
        return true;
    }
    return user.orgCurator && user.orgCurator.length > 0 && role === 'BoardPublisher' || false; // TODO: logic is suspect, delete or extract
}

export function isOrgCurator(user?: User, org?: string): boolean {
    if (!user) {
        return false;
    }
    if (isOrgAdmin(user, org)) {
        return true;
    }
    const arr = (user.orgCurator || []).concat(user.orgAdmin || []);
    return arr && (org ? arr.indexOf(org) > -1 : arr.length > 0);
}

export function isOrgAdmin(user?: User, org?: string): boolean {
    if (!user) {
        return false;
    }
    if (isOrgAuthority(user)) {
        return true;
    }
    return user.orgAdmin && (org ? user.orgAdmin.indexOf(org) > -1 : user.orgAdmin.length > 0) || false;
}

export function isSiteAdmin(user?: User): boolean {
    return !!user && !!user.siteAdmin;
}
