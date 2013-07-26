angular.module('resources', ['ngResource']).
    factory('CdeList', function($resource) {
        return $resource('/listcde');
    })
    .factory('DataElement', function($resource) {
        return $resource('/dataelement/:deId', {deId: '@deId'}, {update: {method: 'PUT'}});
    })
    .factory('PriorCdes', function($resource) {
        return $resource('/priorcdes/:cdeId', {cdeId: '@cdeId'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('CdesInForm', function($resource) {
        return $resource('/cdesinform/:formId', {formId: '@formId'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('CdeDiff', function($resource) {
        return $resource('/cdediff/:deId', {deId: '@deId'});
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
    .factory("Comment", function($http) {
        return {
          addComment: function(comment, success, error) {
            $http.post('/addComment', comment).success(success).error(error);
          }
          , removeComment: function(dat, success, error) {
              $http.post('/removeComment', dat).success(success).error(error);
          } 
        };
    })
    .factory("AccountManagement", function($http) {
        return {
          addSiteAdmin: function(user, success, error) {
            $http.post('/addSiteAdmin', user).success(success).error(error);
          }  
          , removeSiteAdmin: function(user, success, error) {
            $http.post('/removeSiteAdmin', user).success(success).error(error);
          }  
          , addRegAuthAdmin: function(user, success, error) {
            $http.post('/addRegAuthAdmin', user).success(success).error(error);
          }  
          , addRegAuthCurator: function(user, success, error) {
            $http.post('/addRegAuthCurator', user).success(success).error(error);
          }  
          , removeRegAuthAdmin: function(data, success, error) {
            $http.post('/removeRegAuthAdmin', data).success(success).error(error);
          }  
          , removeRegAuthCurator: function(data, success, error) {
            $http.post('/removeRegAuthCurator', data).success(success).error(error);
          }  
          , addRegAuth: function(name, success, error) {
            $http.post('/addRegAuth', name).success(success).error(error);
          }  
          , removeRegAuth: function(id, success, error) {
            $http.post('/removeRegAuth', id).success(success).error(error);
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