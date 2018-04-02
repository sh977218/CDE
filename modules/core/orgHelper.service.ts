import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { UserService } from '_app/user.service';
import { isOrgCurator } from 'shared/system/authorizationShared';
import { Organization } from 'shared/models.model';

type OrgDetailedInfo = any;

@Injectable()
export class OrgHelperService  {
    orgsDetailedInfo: OrgDetailedInfo = {};
    private promise: Promise<OrgDetailedInfo>;

    constructor(
        private http: HttpClient,
        private userService: UserService,
    ) {
        this.reload();
    }

    addLongNameToOrgs(buckets) {
        buckets && buckets.forEach( v => {
            if (this.orgsDetailedInfo[v.key] && this.orgsDetailedInfo[v.key].longName) {
                v.longName = this.orgsDetailedInfo[v.key].longName;
            }
        });
    }

    createOrgDetailedInfoHtml(orgName) {
        if (this.orgsDetailedInfo[orgName]) {
            let anOrg = this.orgsDetailedInfo[orgName];
            if (anOrg.longName || anOrg.mailAddress || anOrg.emailAddress || anOrg.phoneNumber || anOrg.uri) {
                let orgDetailsInfoHtml = '<strong>Organization Details</strong><br/><br/>Name: ' + anOrg.name;
                orgDetailsInfoHtml += (anOrg.longName ? '<br/>Long name: ' + anOrg.longName : '');
                orgDetailsInfoHtml += (anOrg.mailAddress ? '<br/>Mailing address: ' + anOrg.mailAddress : '');
                orgDetailsInfoHtml += (anOrg.emailAddress ? '<br/>E-mail address: ' + anOrg.emailAddress : '');
                orgDetailsInfoHtml += (anOrg.phoneNumber ? '<br/>Phone number: ' + anOrg.phoneNumber : '');
                orgDetailsInfoHtml += (anOrg.uri ? '<br/>Website: ' + anOrg.uri : '');

                return orgDetailsInfoHtml;
            }
        }
        return '';
    }

    getStatusValidationRules(orgName) {
        if (this.orgsDetailedInfo[orgName]) return this.orgsDetailedInfo[orgName].cdeStatusValidationRules;
        else return [];
    }

    getUsedBy(elt) {
        if (elt.classification) {
            let arr = elt.classification.filter(c => this.showWorkingGroup(c.stewardOrg.name)).map(e => e.stewardOrg.name);
            return arr.filter((item, pos) => arr.indexOf(item) === pos);
        } else return [];
    }

    reload() {
        return this.promise = new Promise<OrgDetailedInfo>((resolve, reject) => {
            this.http.get<Organization[]>('/listOrgsDetailedInfo')
                .subscribe(response => {
                    this.orgsDetailedInfo = {};
                    response.forEach(org => {
                        if (org) {
                            Organization.validate(org);
                            this.orgsDetailedInfo[org.name] = org;
                        }
                    });
                    resolve(this.orgsDetailedInfo);
                }, reject);
        });
    }

    showWorkingGroup(orgToHide) {
        if (!this.userService.user) return false;
        if (!this.orgsDetailedInfo) return false;
        let parentOrgOfThisClass = this.orgsDetailedInfo[orgToHide] && this.orgsDetailedInfo[orgToHide].workingGroupOf;
        let isNotWorkingGroup = typeof(parentOrgOfThisClass) === "undefined";
        let userIsWorkingGroupCurator = isOrgCurator(this.userService.user, orgToHide);
        let userIsCuratorOfParentOrg;
        let isSisterOfWg = false;
        if (!isNotWorkingGroup) userIsCuratorOfParentOrg = isOrgCurator(this.userService.user, parentOrgOfThisClass);
        if (!isNotWorkingGroup) {
            if (!this.userService.user.orgAdmin) this.userService.user.orgAdmin = [];
            if (!this.userService.user.orgCurator) this.userService.user.orgCurator = [];
            let userOrgs = [].concat(this.userService.user.orgAdmin, this.userService.user.orgCurator);
            let userWgsParentOrgs = userOrgs.filter(org => this.orgsDetailedInfo[org] && this.orgsDetailedInfo[org].workingGroupOf)
                .map(org => this.orgsDetailedInfo[org].workingGroupOf);
            userWgsParentOrgs.forEach(parentOrg => {
                if (parentOrg === parentOrgOfThisClass) isSisterOfWg = true;
            });
        }
        return isNotWorkingGroup || userIsWorkingGroupCurator || userIsCuratorOfParentOrg || isSisterOfWg;
    }

    then(cb): Promise<OrgDetailedInfo> {
        return this.promise.then(cb);
    }
}


