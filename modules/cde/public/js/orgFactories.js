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
                console.log('ERROR - getOrgsLongNameAPI(): Error retrieving list of orgs');
                $rootScope.orgsLongName = {};
            });
        }
    };
})
.factory('OrgHelpers', function () {
    return {
        addLongNameToOrgs : function(terms, orgsLongName) {
            if(orgsLongName) {
                for(var i=0; i<terms.length; i++) {
                    if(orgsLongName[terms[i].term]) {
                        terms[i].longName = orgsLongName[terms[i].term];
                    }
                }
            }
        }
    };
});