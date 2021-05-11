import * as _intersection from 'lodash/intersection';
import * as _union from 'lodash/union';
import { Board, Comment, Item, rolesEnum, User, UserRoles } from 'shared/models.model';

export type Privilege = 'universalAttach' // (no review, edit can NO longer attach)
    | 'universalComment' // (edit also allows comment)
    | 'universalCreate' // (edit can NO longer create)
    | 'universalEdit'
    | 'universalSearch';
type RolePrivileges = {[key in UserRoles]: {[p in Privilege]?: boolean}};

export const rolePrivileges: Readonly<RolePrivileges> = Object.freeze<RolePrivileges>({
    AttachmentReviewer: {}, // token role
    BoardPublisher: {}, // token role (create public board, also granted to universalEdit)
    CommentAuthor: {
        universalComment: true,
    },
    CommentReviewer: { // token role
        universalComment: true,
    },
    DocumentationEditor: {}, // token role
    NlmCurator: {
        universalAttach: true,
        universalComment: true,
        universalCreate: true,
        universalEdit: true,
        universalSearch: true,
    },
    // orgCurator CDE-2342 (losing create, but edit and search unchanged)
    // orgAdmin CDE-2342 (unchanged past orgCurator)
    // governance: CDE-2351 {
        // universalSearch: true,
        // universalComment: true,
    // }
    OrgAuthority: {}, // token role
});

export function hasPrivilege(user?: User, privilege?: Privilege) {
    if (!user || !privilege) {
        return false;
    }
    if (isSiteAdmin(user)) {
        return true;
    }
    return user.roles ? user.roles.some(role => rolePrivileges[role]) : false;
}

export function canComment(user?: User): boolean {
    return hasPrivilege(user, 'universalComment') || isOrgCurator(user);
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

export function addRole(user: User, role: UserRoles) {
    if (!hasRole(user, role)) {
        user.roles = _intersection(
            _union(
                Array.isArray(user.roles) ? user.roles : [],
                [role]
            ),
            rolesEnum
        );
    }
}

export function hasRole(user?: User, role?: UserRoles): boolean {
    if (!user || !role) {
        return false;
    }
    if (isSiteAdmin(user)) {
        return true;
    }
    if (user.roles && user.roles.indexOf(role) > -1) {
        return true;
    }
    if (role === 'BoardPublisher') {
        return isOrgCurator(user); // was "return user.orgCurator && user.orgCurator.length > 0;"
    }
    return false;
}

export function isOrgCurator(user?: User, org?: string): boolean {
    if (!user) {
        return false;
    }
    if (isOrgAdmin(user, org) || hasPrivilege(user, 'universalEdit')) {
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
