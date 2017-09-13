import { Inject, Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { SharedService } from "./shared.service";

@Injectable()
export class OrgHelperService  {
    orgsDetailedInfo: any;
    orgIsWorkingGroupOf = orgName => this.orgsDetailedInfo[orgName].workingGroupOf
        && this.orgsDetailedInfo[orgName].workingGroupOf.trim() !== '';
    private promise: Promise<void>;

    constructor(private http: Http,
                @Inject("userResource") private userService,
                @Inject("isAllowedModel") private isAllowedModel) {

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
        return this.promise = new Promise<void>(resolve => {
            this.http.get('/listOrgsDetailedInfo')
                .map(r => r.json())
                .subscribe(response => {
                    this.orgsDetailedInfo = {};
                    response.forEach(org => {
                        if (org) {
                            if (!org.propertyKeys) org.propertyKeys = [];
                            if (!org.nameTags) org.nameTags = [];
                            this.orgsDetailedInfo[org.name] = org;
                        }
                    });
                    resolve();
                });
        });
    }

    showWorkingGroup(orgToHide) {
        if (!this.userService.user) return false;
        let parentOrgOfThisClass = this.orgsDetailedInfo[orgToHide] && this.orgsDetailedInfo[orgToHide].workingGroupOf;
        let isNotWorkingGroup = typeof(parentOrgOfThisClass) === "undefined";
        let userIsWorkingGroupCurator = SharedService.auth.isCuratorOf(this.userService.user, orgToHide);
        let userIsCuratorOfParentOrg;
        let isSisterOfWg = false;
        if (!isNotWorkingGroup) userIsCuratorOfParentOrg = SharedService.auth.isCuratorOf(this.userService.user, parentOrgOfThisClass);
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

    then(cb) {
        return this.promise.then(cb);
    }
}


