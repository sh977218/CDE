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
//        addLongNameToOrgs : function(terms, orgsLongName) {
//            if(orgsLongName) {
//                for(var i=0; i<terms.length; i++) {
//                    if(orgsLongName[terms[i].term]) {
//                        terms[i].longName = orgsLongName[terms[i].term];
//                    }
//                }
//            }
//        }
        addLongNameToOrgs : function(terms, orgsDetailedInfo) {
            if(orgsDetailedInfo) {
                for(var i=0; i<terms.length; i++) {
                    if(orgsDetailedInfo[terms[i].term] && orgsDetailedInfo[terms[i].term].longName) {
                        terms[i].longName = orgsDetailedInfo[terms[i].term].longName;
                        terms[i].mailAddress = orgsDetailedInfo[terms[i].term].mailAddress;
                    }
                }
            }
        }
    };
});