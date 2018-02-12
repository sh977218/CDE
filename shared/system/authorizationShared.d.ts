import { User } from 'shared/models.model';

declare const rolesEnum: string[];
declare function canComment(user: User): boolean;
declare function canCreateForms(user: User): boolean;
declare function canOrgAuthority(user: User): boolean;
declare function hasRole(user: User, role: string): boolean;
declare function isOrgCurator(user: User, org?: string): boolean;
declare function isOrgAdmin(user: User, org?: string): boolean;
declare function isSiteAdmin(user: User): boolean;
