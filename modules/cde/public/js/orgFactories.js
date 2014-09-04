angular.module('resources')
.factory('GetOrgsLongName', function($rootScope, $http) {
    return {
        getOrgsLongNameAPI : function() {
            $http.get('/listOrgsLongName').success(function(response) {
                $rootScope.orgsLongName = {};

                // Transforms response to object literal notation
                response.forEach(function(org) {
                    if(org.longName) {
                        $rootScope.orgsLongName[org.name] = org.longName;
                    }
                });
            }).error(function() {
                console.log('ERROR - getOrgsLongNameAPI(): Error retrieving list of orgs long name');
                $rootScope.orgsLongName = {};
            });
        }
    };
})
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
        addLongNameToOrgs : function(terms, orgsDetailedInfo) {
            if(orgsDetailedInfo) {
                for(var i=0; i<terms.length; i++) {
                    if(orgsDetailedInfo[terms[i].term] && orgsDetailedInfo[terms[i].term].longName) {
                        terms[i].longName = orgsDetailedInfo[terms[i].term].longName;
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
        }
    };
});