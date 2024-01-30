import { HttpClient } from '@angular/common/http';
import { forwardRef, Inject, Injectable } from '@angular/core';
import { UserService } from '_app/user.service';
import { CbErr, Elt } from 'shared/models.model';
import { Organization, StatusValidationRules } from 'shared/organization/organization';
import { validateOrganization } from 'shared/organization/organizationShared';
import { isOrgCurator } from 'shared/security/authorizationShared';
import { noop } from 'shared/util';

interface OrgDetailedInfo {
    [org: string]: Organization;
}

@Injectable()
export class OrgHelperService {
    private orgsDetailedInfo: OrgDetailedInfo = {};
    private promise!: Promise<OrgDetailedInfo>;

    constructor(
        @Inject(forwardRef(() => HttpClient)) private http: HttpClient,
        @Inject(forwardRef(() => UserService)) private userService: UserService // only used for synchronous showWorkingGroup
    ) {
        this.reload();
    }

    addLongNameToOrgs(buckets: any) {
        if (buckets) {
            buckets.forEach((v: any) => {
                if (this.orgsDetailedInfo[v.key] && this.orgsDetailedInfo[v.key].longName) {
                    v.longName = this.orgsDetailedInfo[v.key].longName;
                }
            });
        }
    }

    sortOrganizationsEndorsedFirst(buckets: any[]) {
        if (buckets) {
            buckets.sort((o1: any, o2: any) => {
                const orgsDetailedInfo1 = this.orgsDetailedInfo[o1.key];
                const orgsDetailedInfo2 = this.orgsDetailedInfo[o2.key];
                const endorsed1 = orgsDetailedInfo1?.endorsed || false;
                const endorsed2 = orgsDetailedInfo2?.endorsed || false;
                if (endorsed1 && !endorsed2) {
                    return -1;
                }
                if (!endorsed1 && endorsed2) {
                    return 1;
                } else {
                    return o1.key.localeCompare(o2.key);
                }
            });
        }
    }

    catch(cb: CbErr): Promise<any> {
        return this.promise.catch(cb);
    }

    createOrgDetailedInfoHtml(orgName: string) {
        if (this.orgsDetailedInfo[orgName]) {
            const anOrg = this.orgsDetailedInfo[orgName];
            if (anOrg.longName || anOrg.mailAddress || anOrg.emailAddress || anOrg.phoneNumber || anOrg.uri) {
                let orgDetailsInfoHtml = 'Organization Details';
                orgDetailsInfoHtml += '\nName: ' + anOrg.name;
                if (anOrg.longName) {
                    orgDetailsInfoHtml += '\nLong name: ' + anOrg.longName;
                }
                if (anOrg.mailAddress) {
                    orgDetailsInfoHtml += '\nMailing address: ' + anOrg.mailAddress;
                }
                if (anOrg.emailAddress) {
                    orgDetailsInfoHtml += '\nE-mail address: ' + anOrg.emailAddress;
                }
                if (anOrg.phoneNumber) {
                    orgDetailsInfoHtml += '\nPhone number: ' + anOrg.phoneNumber;
                }
                if (anOrg.uri) {
                    orgDetailsInfoHtml += '\nWebsite: ' + anOrg.uri;
                }

                return orgDetailsInfoHtml;
            }
        }
        return '';
    }

    getStatusValidationRules(orgName: string): StatusValidationRules[] {
        return this.orgsDetailedInfo[orgName] ? this.orgsDetailedInfo[orgName].cdeStatusValidationRules : [];
    }

    getUsedBy(elt: Elt) {
        if (elt.classification) {
            const arr = elt.classification
                .filter(c => this.showWorkingGroup(c.stewardOrg.name))
                .map(e => e.stewardOrg.name);
            return arr.filter((item, pos) => arr.indexOf(item) === pos);
        } else {
            return [];
        }
    }

    reload(): Promise<OrgDetailedInfo> {
        return (this.promise = new Promise<OrgDetailedInfo>((resolve, reject) => {
            this.http.get<Organization[]>('/server/orgManagement/listOrgsDetailedInfo').subscribe(response => {
                this.orgsDetailedInfo = {};
                response.forEach(org => {
                    if (org) {
                        validateOrganization(org);
                        this.orgsDetailedInfo[org.name] = org;
                    }
                });
                this.userService
                    .waitForUser()
                    .catch(noop)
                    .then(() => resolve(this.orgsDetailedInfo));
            }, reject);
        }));
    }

    showWorkingGroup(orgToHide: string) {
        if (!this.orgsDetailedInfo) {
            return false;
        }
        const parentOrgOfThisClass =
            this.orgsDetailedInfo[orgToHide] && this.orgsDetailedInfo[orgToHide].workingGroupOf;
        if (typeof parentOrgOfThisClass === 'undefined') {
            return true;
        }

        if (!this.userService.user) {
            return false;
        }
        if (isOrgCurator(this.userService.user, orgToHide)) {
            return true;
        }
        if (isOrgCurator(this.userService.user, parentOrgOfThisClass)) {
            return true;
        }

        let isSisterOfWg = false;
        this.userService.user.orgAdmin
            .concat(this.userService.user.orgCurator, this.userService.user.orgEditor)
            .filter(org => this.orgsDetailedInfo[org] && this.orgsDetailedInfo[org].workingGroupOf)
            .map(org => this.orgsDetailedInfo[org].workingGroupOf)
            .forEach(parentOrg => {
                if (parentOrg === parentOrgOfThisClass) {
                    isSisterOfWg = true;
                }
            });
        return isSisterOfWg;
    }

    then(cb: (info: OrgDetailedInfo) => any, errorCb?: CbErr): Promise<any> {
        return this.promise.then(cb, errorCb);
    }
}
