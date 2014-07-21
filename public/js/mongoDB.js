angular.module('resources')
.factory('GetOrgsProjection', function($rootScope, $interval, $http) {
    var getOrgsProjectionInterval = 1000 * 60 * 60 * 1; // 1 hour
    
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
});