angular.module('OrgFactories', ['ngResource'])
.factory('OrgHelpers', ["$http", "$q", function ($http, $q) {
    var orgHelpers = {
        orgsDetailedInfo: {}
        , deferred: $q.defer()
        , addLongNameToOrgs : function(buckets) {
            if(this.orgsDetailedInfo) {
                for(var i=0; i<buckets.length; i++) {
                    if(this.orgsDetailedInfo[buckets[i].key] && this.orgsDetailedInfo[buckets[i].key].longName) {
                        buckets[i].longName = this.orgsDetailedInfo[buckets[i].key].longName;
                    }
                }
            }
        }
        , createOrgDetailedInfoHtml : function(orgName) {
            if(this.orgsDetailedInfo && this.orgsDetailedInfo[orgName]) {
                var anOrg = this.orgsDetailedInfo[orgName];

                if(anOrg.longName || anOrg.mailAddress || anOrg.emailAddress || anOrg.phoneNumber || anOrg.uri) {
                    var orgDetailsInfoHtml = '<strong>Organization Details</strong><br/><br/>Name: '+anOrg.name;
                    orgDetailsInfoHtml += (anOrg.longName ? '<br/>Long name: '+anOrg.longName : '');
                    orgDetailsInfoHtml += (anOrg.mailAddress ? '<br/>Mailing address: '+anOrg.mailAddress : '');
                    orgDetailsInfoHtml += (anOrg.emailAddress ? '<br/>E-mail address: '+anOrg.emailAddress : '');
                    orgDetailsInfoHtml += (anOrg.phoneNumber ? '<br/>Phone number: '+anOrg.phoneNumber : '');
                    orgDetailsInfoHtml += (anOrg.uri ? '<br/>Website: '+anOrg.uri : '');

                    return orgDetailsInfoHtml;
                }
            }

            return '';
        }
        , orgIsWorkingGroupOf : function(orgName) {
            if (!this.orgsDetailedInfo) return false;
            return this.orgsDetailedInfo[orgName].workingGroupOf && this.orgsDetailedInfo[orgName].workingGroupOf.trim()!=='';
        }
        , getOrgsDetailedInfoAPI: function (cb) {
            var OrgHelpers = this;
            $http.get('/listOrgsDetailedInfo').then(function onSuccess(response) {
                // Transforms response to object literal notation
                response.data.forEach(function (org) {
                    if (org) {
                        if (!org.propertyKeys) org.propertyKeys = [];
                        if (!org.nameTags) org.nameTags = [];
                        OrgHelpers.orgsDetailedInfo[org.name] = org;
                    }
                });
                OrgHelpers.deferred.resolve();
                if (cb) cb();
            }).catch(function onError() {
                console.log("Cannot get org detailed info.");
            });
        }
        , showWorkingGroup: function(orgToHide, user) {
            var OrgHelpers = this;
            if (!user) return false;
            var parentOrgOfThisClass = OrgHelpers.orgsDetailedInfo[orgToHide] &&
                OrgHelpers.orgsDetailedInfo[orgToHide].workingGroupOf;
            var isNotWorkingGroup = typeof(parentOrgOfThisClass) === "undefined";
            var userIsWorkingGroupCurator = exports.isCuratorOf(user, orgToHide);
            if (!isNotWorkingGroup) var userIsCuratorOfParentOrg = exports.isCuratorOf(user, parentOrgOfThisClass);
            if (!isNotWorkingGroup) {
                var isSisterOfWg = false;
                if (!user.orgAdmin) user.orgAdmin = [];
                if (!user.orgCurator) user.orgCurator = [];
                var userOrgs = [].concat(user.orgAdmin, user.orgCurator);
                var userWgsParentOrgs = userOrgs.filter(function (org) {
                    return OrgHelpers.orgsDetailedInfo[org] && OrgHelpers.orgsDetailedInfo[org].workingGroupOf;
                }).map(function (org) {
                    return OrgHelpers.orgsDetailedInfo[org].workingGroupOf;
                });
                userWgsParentOrgs.forEach(function (parentOrg) {
                    if (parentOrg === parentOrgOfThisClass) isSisterOfWg = true;
                });
            }
            return isNotWorkingGroup || userIsWorkingGroupCurator || userIsCuratorOfParentOrg || isSisterOfWg;
        }
        , getUsedBy: function(elt, user) {
            if (elt.classification) {
                var arr = elt.classification.filter(function (c) {
                    return orgHelpers.showWorkingGroup(c.stewardOrg.name, user);
                }).map(function (e) {
                    return e.stewardOrg.name;
                });
                return arr.filter(function (item, pos) {
                    return arr.indexOf(item) === pos;
                });
            } else return [];
        }
        , getStatusValidationRules: function(orgName){
            if (this.orgsDetailedInfo[orgName]) return this.orgsDetailedInfo[orgName].cdeStatusValidationRules;
            else return [];
        }
    };
    orgHelpers.getOrgsDetailedInfoAPI();
    return orgHelpers;
}]);