angular.module('resources')
.factory('getOrgsProjection', function($rootScope, $interval) {
    var getOrgsProjectionInterval = 10*1000;
    
    function callGetOrgsProjectionAPI() {
        /*return [{name:'AECC', longName:'aecc blah balh'}, 
                {name:'CCR', longName:'ccr blah blah'}, 
                {name:'CDC/PHIN', longName:'cdc/phin blah blah'},
                {name:'CIP', longName:'cip blah blah'},
                {name:'CITN', longName:'citn blah blah'},
                {name:'CTEP', longName:'ctep blah blah'}];*/
            
        return {'AECC':'aecc blah balh', 
                'CCR':'ccr blah blah', 
                'CDC/PHIN':'cdc/phin blah blah',
                'CIP':'cip blah blah',
                'CITN':'citn blah blah',
                'CTEP':'ctep blah blah'};
    }
    
    $rootScope.orgsProjection = callGetOrgsProjectionAPI();
    
    $interval(function() {
        $rootScope.orgsProjection = callGetOrgsProjectionAPI();
    }, getOrgsProjectionInterval);
});