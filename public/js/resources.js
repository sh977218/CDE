angular.module('resources', ['ngResource']).
    factory('CdeList', function($resource) {
        return $resource('/listcde');
    })
    .factory('DataElement', function($resource) {
        return $resource('/dataelement/:cdeId', {cdeId: '@cdeId'}, {update: {method: 'PUT'}});
    })
    .factory('PriorCdes', function($resource) {
        return $resource('/priorcdes/:cdeId', {cdeId: '@cdeId'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('CdesInForm', function($resource) {
        return $resource('/cdesinform/:formId', {formId: '@formId'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('AutocompleteSvc', function($resource) {
        return $resource("/autocomplete");
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
    .factory("AccountManagement", function($http) {
        return {
          addNlmAdmin: function(user, success, error) {
            $http.post('/addNlmAdmin', user).success(success).error(error);
          }  
          , removeNlmAdmin: function(user, success, error) {
            $http.post('/removeNlmAdmin', user).success(success).error(error);
          }  
          , addContextAdmin: function(user, success, error) {
            $http.post('/addContextAdmin', user).success(success).error(error);
          }  
          , removeContextAdmin: function(data, success, error) {
            $http.post('/removeContextAdmin', data).success(success).error(error);
          }  
          , addContext: function(name, success, error) {
            $http.post('/addContext', name).success(success).error(error);
          }  
          , removeContext: function(id, success, error) {
            $http.post('/removeContext', id).success(success).error(error);
          }  
        };
    })
    .factory("LinkToVsac", function($resource) {
        return $resource(
                "/linktovsac", 
                {cde_id: '@cde_id', vs_id: '@vs_id'}, 
                {link: {method: 'POST'}}
            );
    })
    .factory('Form', function($resource) {
        return $resource('/form/:formId', {formId: '@formId'});
    })
    .factory('FormList', function($resource) {
        return $resource('/formlist');
    })
    .factory('CdesForApproval', function($resource) {
        return $resource('/cdesforapproval');
    })
    .factory('MyCart', function($resource) {
        return $resource('/cartcontent');
    })
    .factory("AddToCart", function($resource) {
        return $resource(
                "/addtocart/:formId", 
                {formId: '@formId'}, 
                {add: {method: 'POST'}}
            );
    })
    .factory("AddCdeToForm", function($resource) {
        return $resource(
                "/addcdetoform/:cdeId/:formId", 
                {formId: '@formId', cdeId: '@cdeId'}, 
                {add: {method: 'POST'}}
            );
    })
    .factory("RemoveFromCart", function($resource) {
        return $resource(
                "/removefromcart/:formId", 
                {formId: '@formId'}, 
                {add: {method: 'POST'}}
            );
    })
    .factory('Myself', function($resource) {
        return $resource('/user/me');
    })
    ;