angular.module('resources')
.factory('GetOrgsProjection', function($rootScope, $interval, $http) {
    var getOrgsProjectionInterval = 1000 * 60 * 10 * 1; // 10 min
    
    function callGetOrgsProjectionAPI() {
        $http.get('/listOrgsProjection').success(function(response) {
            $rootScope.orgsProjection = response;
        }).error(function() {
            console.log('ERROR - callGetOrgsProjectionAPI: Error retrieving list of orgs');
        });
    }
    
    callGetOrgsProjectionAPI();
    
    $interval(function() {
        callGetOrgsProjectionAPI();
    }, getOrgsProjectionInterval);
})
.factory('OrgHelpers', function () {
    return {
        addLongNameToOrgs : function(terms, orgsProjection) {
            if(orgsProjection) {
                for(var i=0; i<terms.length; i++) {
                    if(orgsProjection[terms[i].term]) {
                        terms[i].longName = orgsProjection[terms[i].term];
                    }
                }
            }
        }
    }
});