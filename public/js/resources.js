angular.module('resources', ['ngResource']).
    factory('CdeList', function($resource) {
        var CdeList = $resource('/listcde');
        return CdeList;
    })
    .factory('DataElement', function($resource) {
        var DataElement = $resource('/dataelement/:cdeId', {cdeId: '@cdeId'}, {update: {method: 'PUT'}});
        return DataElement;
    })
    .factory('PriorCdes', function($resource) {
        var PriorCdes = $resource('/priorcdes/:cdeId', {cdeId: '@cdeId'}, 
            {'getCdes': {method: 'GET', isArray: true}});
        return PriorCdes;
    })
    .factory('AutocompleteSvc', function($resource) {
        var AutocompleteSvc = $resource("/autocomplete/:inValue", {inValue: '@inValue'},
            {'autocomplete': {method: 'GET', isArray: true}});
        return AutocompleteSvc;
    })
    .factory('Auth', function($http){
        return {
            register: function(user, success, error) {
                $http.post('/register', user).success(success).error(error);
            },
            login: function(user, success, error) {
                $http.post('/login', user).success(success).error(error);
            },
            logout: function(success, error) {
                $http.post('/logout').success(success).error(error);
            }
        };
    })
    .factory("LinkToVsac", function($resource) {
        var LinkToVsac = $resource(
                "/linktovsac", 
                {cde_id: '@cde_id', vs_id: '@vs_id'}, 
                {link: {method: 'POST'}}
            );
        return LinkToVsac;
    })
    .factory('Form', function($resource) {
        var Form = $resource('/form');
        return Form;
    })
    .factory('FormList', function($resource) {
        var FormList = $resource('/formlist');
        return FormList;
    })
    ;