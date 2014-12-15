angular.module('resources')
.factory('GetOrgsDetailedInfo', function($rootScope, $http) {
    return {
        getOrgsDetailedInfoAPI : function() {
            $http.get('/listOrgsDetailedInfo').success(function(response) {
                $rootScope.orgsDetailedInfo = {};

                // Transforms response to object literal notation
                response.forEach(function(org) {
                    if(org) {
                        $rootScope.orgsDetailedInfo[org.name] = org;
                    }
                });
            }).error(function() {
                console.log('ERROR - getOrgsDetailedInfoAPI(): Error retrieving list of orgs detailed info');
                $rootScope.orgsDetailedInfo = {};
            });
        }
    };
})
.factory('OrgHelpers', function () {
    return {
        addLongNameToOrgs : function(buckets, orgsDetailedInfo) {
            if(orgsDetailedInfo) {
                for(var i=0; i<buckets.length; i++) {
                    if(orgsDetailedInfo[buckets[i].key] && orgsDetailedInfo[buckets[i].key].longName) {
                        buckets[i].longName = orgsDetailedInfo[buckets[i].key].longName;
                    }
                }
            }
        },
        createOrgDetailedInfoHtml : function(orgName, orgsDetailedInfo) {
            if(orgsDetailedInfo && orgsDetailedInfo[orgName]) {
                var anOrg = orgsDetailedInfo[orgName];
                
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
        },
        orgIsWorkingGroupOf : function(orgName, orgsDetailedInfo) {
            if (!orgsDetailedInfo) return false;
            if( orgsDetailedInfo[orgName].workingGroupOf && orgsDetailedInfo[orgName].workingGroupOf.trim()!=='' ) {
                return true;
            }
            return false;
        }
    };
});