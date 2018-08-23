import { Elt, User } from 'shared/models.model';
import { DataElement } from 'shared/de/dataElement.model';
import { CdeForm } from 'shared/form/form.model';

declare const rolesEnum: string[];
declare function canComment(user?: User): boolean;
declare function canEditCuratedItem(user?: User, item?: DataElement|CdeForm): boolean;
declare function canOrgAuthority(user?: User): boolean;
declare function canRemoveComment(user?: User, comment?: Comment, element?: Elt): boolean;
declare function hasRole(user?: User, role?: string): boolean;
declare function isOrgCurator(user?: User, org?: string): boolean;
declare function isOrgAdmin(user?: User, org?: string): boolean;
declare function isSiteAdmin(user?: User): boolean;
