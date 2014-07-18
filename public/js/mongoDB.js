angular.module('resources')
.factory('getOrgsProjection', function($rootScope, $interval) {
    function callGetOrgsProjectionAPI() {
        return { name: 'abc', longName: 'american born chinese' };
    }
    
    $interval(function() {
        $rootScope.orgsProjection = callGetOrgsProjectionAPI();
        console.log('---------------------------------------------------'+$rootScope.orgsProjection);
    }, 10*1000);
});