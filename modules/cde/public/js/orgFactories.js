angular.module('resources')
.factory('OrgHelpers', function ($http) {
    return {    
        orgsDetailedInfo: {}
        , isInitialized : function() {
            return Object.keys(this.orgsDetailedInfo).length !== 0;
        }
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
            if( this.orgsDetailedInfo[orgName].workingGroupOf && this.orgsDetailedInfo[orgName].workingGroupOf.trim()!=='' ) {
                return true;
            }
            return false;
        }
        , getOrgsDetailedInfoAPI : function(cb) {
            var OrgHelpers = this;
            $http.get('/listOrgsDetailedInfo').success(function(response) {

                // Transforms response to object literal notation
                response.forEach(function(org) {
                    if(org) {
                        OrgHelpers.orgsDetailedInfo[org.name] = org;
                    }
                });
                if (cb) cb();
            }).error(function() {
            });
        }    
        , showWorkingGroup: function(orgToHide, user) {
            if (!this.isInitialized()) return true;
            var OrgHelpers = this;
            var parentOrgOfThisClass = this.orgsDetailedInfo[orgToHide] && this.orgsDetailedInfo[orgToHide].workingGroupOf;
            var isNotWorkingGroup = typeof(parentOrgOfThisClass) === "undefined";
            var userIsWorkingGroupCurator = exports.isCuratorOf(user, orgToHide);
            if (!isNotWorkingGroup) var userIsCuratorOfParentOrg = exports.isCuratorOf(user, parentOrgOfThisClass);
            if (!isNotWorkingGroup) {
                var isSisterOfWg = false;  
                if (!user.orgAdmin) user.orgAdmin = [];
                if (!user.orgCurator) user.orgCurator = [];
                var myOrgs = [].concat(user.orgAdmin, user.orgCurator);
                var userWgsParentOrgs = myOrgs.filter(function(org) {
                    return OrgHelpers.orgsDetailedInfo[org].workingGroupOf;
                }).map(function(org) {
                    return OrgHelpers.orgsDetailedInfo[org].workingGroupOf
                });
                userWgsParentOrgs.forEach(function(parentOrg){
                    if (parentOrg===parentOrgOfThisClass) isSisterOfWg = true;
                });                
            }
            return isNotWorkingGroup || userIsWorkingGroupCurator || userIsCuratorOfParentOrg || isSisterOfWg;        
        }       
    };
});