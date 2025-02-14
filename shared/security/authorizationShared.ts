import { intersection, union } from 'lodash';
import { Board, isBoard } from 'shared/board.model';
import { Item } from 'shared/item';
import { assertUnreachable, rolesEnum, User, UserRole } from 'shared/models.model';

export type Privilege = 'attach' | 'changeStatus' | 'create' | 'edit';
type Privileges = Record<Privilege, boolean>;
type PrivilegesRegistry = Record<string, Privileges>;

export type RolePrivilege =
    | 'universalAttach' // (no review, edit can NO longer attach)
    | 'universalBundling' // manage 'isBundle' protected field
    | 'universalComment'
    | 'universalCommentManage'
    | 'universalCreate' // (edit can NO longer create)
    | 'universalEdit'
    | 'universalSearch';
type RolePrivileges = Partial<Record<RolePrivilege, boolean>>;
type RolePrivilegesRegistry = Record<UserRole, RolePrivileges>;

const orgEditorDefaultPrivileges: Readonly<Privileges> = Object.freeze<Privileges>({
    attach: false,
    changeStatus: true,
    create: true,
    edit: true,
});
const orgCuratorDefaultPrivileges: Readonly<Privileges> = Object.freeze<Privileges>({
    attach: false,
    changeStatus: false,
    create: false,
    edit: false,
});
const orgAdminDefaultPrivileges: Readonly<Privileges> = Object.freeze<Privileges>({
    attach: false,
    changeStatus: false,
    create: false,
    edit: false,
});

export const orgEditorPrivileges: Readonly<PrivilegesRegistry> = Object.freeze<PrivilegesRegistry>({
    default: orgEditorDefaultPrivileges,
    // MyOrg: addEditorOrg({
    //     edit: true,
    // }),
});

export const orgCuratorPrivileges: Readonly<PrivilegesRegistry> = Object.freeze<PrivilegesRegistry>({
    default: orgCuratorDefaultPrivileges,
    // MyOrg: addCuratorOrg({
    //     edit: true,
    // }),
});

export const orgAdminPrivileges: Readonly<PrivilegesRegistry> = Object.freeze<PrivilegesRegistry>({
    default: orgAdminDefaultPrivileges,
    // MyOrg: addAdminOrg({
    //     edit: true,
    // }),
});

export const rolePrivileges: Readonly<RolePrivilegesRegistry> = Object.freeze<RolePrivilegesRegistry>({
    AttachmentReviewer: {}, // token role
    BoardPublisher: {},
    DocumentationEditor: {}, // token role
    GovernanceGroup: {
        universalComment: true,
        universalSearch: true,
    },
    NlmCurator: {
        universalAttach: true,
        universalBundling: true,
        universalComment: true,
        universalCreate: true,
        universalEdit: true,
        universalSearch: true,
    },
    OrgAuthority: {
        // token role
        universalAttach: true,
        universalBundling: true,
        universalComment: true,
        universalCommentManage: true,
        universalCreate: true,
        universalEdit: true,
        universalSearch: true,
    },
});

/**
 * Individual Privilege (1 Function = 1 Privilege) Can user ...?
 */

export const canAttach = canPrivilegeForUser('attach');
export const canClassify = canPrivilegeForUser('edit');

export function canBundle(user: User | undefined): boolean {
    return hasRolePrivilege(user, 'universalBundling');
}

export function canClassifyOrg(user: User | undefined, org: string | undefined): boolean {
    if (!user) {
        return false;
    }
    if (isOrgAuthority(user)) {
        return true;
    }
    return hasPrivilegeForOrg(user, 'edit', org);
}

export function canEditArticle(user: User | undefined): boolean {
    return hasRole(user, 'DocumentationEditor');
}

export function canEditCuratedItem(user: User | undefined, item: Item | undefined): boolean {
    if (!user || !item || item.archived || !item.registrationState) {
        return false;
    }
    if (isOrgAuthority(user)) {
        return true;
    }
    if (
        item.registrationState.registrationStatus === 'Standard' ||
        item.registrationState.registrationStatus === 'Preferred Standard'
    ) {
        return false;
    }
    return hasPrivilegeForOrg(user, 'edit', item.stewardOrg.name);
}

export function canSubmissionReview(user: User | undefined) {
    return hasRole(user, 'GovernanceGroup') || isOrgAuthority(user);
}

export function canSubmissionSubmit(user: User | undefined) {
    return isNlmCurator(user) || canSubmissionReview(user);
}

/**
 * Token Roles (Old way) REMOVE and replace with individual privileges per use
 */

export function isDocumentationEditor<T>(elt: T, user?: User) {
    return hasRole(user, 'DocumentationEditor');
}

export function isNlmCurator(user: User | undefined): boolean {
    return hasRole(user, 'NlmCurator');
}

export function isOrgAuthority(user: User | undefined): boolean {
    return hasRole(user, 'OrgAuthority');
}

/**
 * API Exports
 */

export function isOrg(user: User | undefined): boolean {
    if (!user) {
        return false;
    }
    return (
        (user.orgAdmin && !!user.orgAdmin.length) ||
        (user.orgCurator && !!user.orgCurator.length) ||
        (user.orgEditor && !!user.orgEditor.length)
    );
}

export function isOrgAdmin(user: User | undefined, org?: string): boolean {
    if (!user) {
        return false;
    }
    if (isOrgAuthority(user)) {
        return true;
    }
    return (user.orgAdmin && (org ? user.orgAdmin.indexOf(org) > -1 : user.orgAdmin.length > 0)) || false;
}

export function isOrgCurator(user: User | undefined, org?: string): boolean {
    if (!user) {
        return false;
    }
    if (isOrgAdmin(user, org) || hasRolePrivilege(user, 'universalEdit')) {
        return true;
    }
    const arr = (user.orgCurator || []).concat(user.orgAdmin || []);
    return arr && (org ? arr.indexOf(org) > -1 : arr.length > 0);
}

export function isSiteAdmin(user: User | undefined): boolean {
    return !!user && !!user.siteAdmin;
}

/**
 * Low-level exports for specific permission sources
 */

export function hasPrivilege(user: User | undefined, privilege: Privilege | undefined): boolean {
    if (!user || !privilege) {
        return false;
    }
    if (isSiteAdmin(user) || hasPrivilegeInRoles(user, privilege)) {
        return true;
    }
    return (
        user.orgAdmin.some(org => getPrivilegeFromOrgRegistry(orgAdminPrivileges, org, privilege)) ||
        user.orgCurator.some(org => getPrivilegeFromOrgRegistry(orgCuratorPrivileges, org, privilege)) ||
        user.orgEditor.some(org => getPrivilegeFromOrgRegistry(orgEditorPrivileges, org, privilege))
    );
}

export function hasPrivilegeForOrg(
    user: User | undefined,
    privilege: Privilege | undefined,
    org: string | undefined
): boolean {
    if (isSiteAdmin(user)) {
        return true;
    }
    if (!user || !privilege || !org) {
        return false;
    }
    if (hasPrivilegeInRoles(user, privilege)) {
        return true;
    }
    return (
        (user.orgAdmin.includes(org) && getPrivilegeFromOrgRegistry(orgAdminPrivileges, org, privilege)) ||
        (user.orgCurator.includes(org) && getPrivilegeFromOrgRegistry(orgCuratorPrivileges, org, privilege)) ||
        (user.orgEditor.includes(org) && getPrivilegeFromOrgRegistry(orgEditorPrivileges, org, privilege))
    );
}

export function hasPrivilegeInRoles(user: User, privilege: Privilege): boolean {
    switch (privilege) {
        case 'attach':
            return hasRolePrivilege(user, 'universalAttach');
        case 'changeStatus':
            return false;
        case 'create':
            return hasRolePrivilege(user, 'universalCreate');
        case 'edit':
            return hasRolePrivilege(user, 'universalEdit');
        default:
            throw assertUnreachable(privilege);
    }
}

export function hasRolePrivilege(user: User | undefined, privilege: RolePrivilege | undefined): boolean {
    if (isSiteAdmin(user)) {
        return true;
    }
    if (!user || !privilege) {
        return false;
    }
    return Array.isArray(user.roles) ? user.roles.some(role => rolePrivileges[role][privilege]) : false;
}

/**
 * Role Management
 */

export function addRole(user: User, role: UserRole) {
    if (!hasRole(user, role)) {
        user.roles = intersection(union(Array.isArray(user.roles) ? user.roles : [], [role]), rolesEnum);
    }
}

export function hasRole(user: User | undefined, role: UserRole | undefined): boolean {
    if (!user || !role) {
        return false;
    }
    if (isSiteAdmin(user)) {
        return true;
    }
    return Array.isArray(user.roles) ? user.roles.indexOf(role) > -1 : false;
}

/**
 * API helpers
 */

function canPrivilegeForUser(privilege: Privilege) {
    return (user: User | undefined): boolean => {
        if (!user) {
            return false;
        }
        if (isSiteAdmin(user)) {
            return true;
        }
        return hasPrivilege(user, privilege);
    };
}

/**
 *  Organization-based Privilege Helpers
 */

function addAdminOrg(privileges: Partial<Privileges>) {
    return Object.assign<Privileges, Partial<Privileges>>(Object.create(orgAdminDefaultPrivileges), privileges);
}

function addCuratorOrg(privileges: Partial<Privileges>) {
    return Object.assign<Privileges, Partial<Privileges>>(Object.create(orgCuratorDefaultPrivileges), privileges);
}

function addEditorOrg(privileges: Partial<Privileges>) {
    return Object.assign<Privileges, Partial<Privileges>>(Object.create(orgEditorDefaultPrivileges), privileges);
}

function getPrivilegeFromOrgRegistry(registry: PrivilegesRegistry, org: string, privilege: Privilege): boolean {
    const orgPrivileges = registry[org];
    return orgPrivileges ? orgPrivileges[privilege] : registry.default[privilege];
}
