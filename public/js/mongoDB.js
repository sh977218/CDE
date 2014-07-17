angular.module('resources')
.factory('getOrgsProjection', function($rootScope, $interval) {
    var testvar = 'a';
    $interval(function() {
        testvar += 'a';
        console.log('---------------------------------------------------'+testvar);
    }, 2000);

    //var orglist = 'a, b, c';

    //return orglist;
});