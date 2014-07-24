angular.module('resources')
.factory('GetOrgsLongNames', function($rootScope, $interval, $http) {
    var getOrgsLongNameInterval = 1000 * 60 * 10 * 1; // 10 min
    
    function callGetOrgsLongNameAPI() {
        $http.get('/listOrgsLongNames').success(function(response) {
            $rootScope.orgsLongName = response;
        }).error(function() {
            console.log('ERROR - callGetOrgsLongNameAPI: Error retrieving list of orgs');
        });
    }
    
    callGetOrgsLongNameAPI();
    
    $interval(function() {
        callGetOrgsLongNameAPI();
    }, getOrgsLongNameInterval);
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
    }
});