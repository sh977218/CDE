import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import _noop from 'lodash/noop';

import { UserService } from '_app/user.service';
import { CbErr, Elt, Organization } from 'shared/models.model';
import { isOrgCurator } from 'shared/system/authorizationShared';

type OrgDetailedInfo = {[org: string]: Organization};

@Injectable()
export class OrgHelperService  {
    orgsDetailedInfo: OrgDetailedInfo = {};
    private promise!: Promise<OrgDetailedInfo>;

    constructor(
        private http: HttpClient,
        private userService: UserService, // only used for synchronous showWorkingGroup
    ) {
        this.reload();
    }

    addLongNameToOrgs(buckets: any) {
        buckets && buckets.forEach( (v: any) => {
            if (this.orgsDetailedInfo[v.key] && this.orgsDetailedInfo[v.key].longName) {
                v.longName = this.orgsDetailedInfo[v.key].longName;
            }
        });
    }

    catch(cb: CbErr): Promise<any> {
        return this.promise.catch(cb);
    }

    createOrgDetailedInfoHtml(orgName: string) {
        if (this.orgsDetailedInfo[orgName]) {
            let anOrg = this.orgsDetailedInfo[orgName];
            if (anOrg.longName || anOrg.mailAddress || anOrg.emailAddress || anOrg.phoneNumber || anOrg.uri) {
                let orgDetailsInfoHtml = 'Organization Details';
                orgDetailsInfoHtml += '\nName: ' + anOrg.name;
                if (anOrg.longName) orgDetailsInfoHtml += '\nLong name: ' + anOrg.longName;
                if (anOrg.mailAddress) orgDetailsInfoHtml += '\nMailing address: ' + anOrg.mailAddress;
                if (anOrg.emailAddress) orgDetailsInfoHtml += '\nE-mail address: ' + anOrg.emailAddress;
                if (anOrg.phoneNumber) orgDetailsInfoHtml += '\nPhone number: ' + anOrg.phoneNumber;
                if (anOrg.uri) orgDetailsInfoHtml += '\nWebsite: ' + anOrg.uri;

                return orgDetailsInfoHtml;
            }
        }
        return '';
    }

    getStatusValidationRules(orgName: string) {
        if (this.orgsDetailedInfo[orgName]) return this.orgsDetailedInfo[orgName].cdeStatusValidationRules;
        else return [];
    }

    getUsedBy(elt: Elt) {
        if (elt.classification) {
            let arr = elt.classification.filter(c => this.showWorkingGroup(c.stewardOrg.name)).map(e => e.stewardOrg.name);
            return arr.filter((item, pos) => arr.indexOf(item) === pos);
        } else return [];
    }

    reload() {
        return this.promise = new Promise<OrgDetailedInfo>((resolve, reject) => {
            let userPromise = this.userService.catch(_noop);
            this.http.get<Organization[]>('/listOrgsDetailedInfo').subscribe(response => {
                this.orgsDetailedInfo = {};
                response.forEach(org => {
                    if (org) {
                        Organization.validate(org);
                        this.orgsDetailedInfo[org.name] = org;
                    }
                });
                userPromise.then(() => resolve(this.orgsDetailedInfo));
            }, reject);
        });
    }

    showWorkingGroup(orgToHide: string) {
        if (!this.orgsDetailedInfo) return false;
        let parentOrgOfThisClass = this.orgsDetailedInfo[orgToHide] && this.orgsDetailedInfo[orgToHide].workingGroupOf;
        if (typeof(parentOrgOfThisClass) === "undefined") return true;

        if (!this.userService.user) return false;
        if (isOrgCurator(this.userService.user, orgToHide)) return true;
        if (isOrgCurator(this.userService.user, parentOrgOfThisClass)) return true;

        let isSisterOfWg = false;
        this.userService.user.orgAdmin.concat(this.userService.user.orgCurator)
            .filter(org => this.orgsDetailedInfo[org] && this.orgsDetailedInfo[org].workingGroupOf)
            .map(org => this.orgsDetailedInfo[org].workingGroupOf)
            .forEach(parentOrg => {
                if (parentOrg === parentOrgOfThisClass) isSisterOfWg = true;
            });
        return isSisterOfWg;
    }

    then(cb: (info: OrgDetailedInfo) => any, errorCb?: CbErr): Promise<any> {
        return this.promise.then(cb, errorCb);
    }
}
