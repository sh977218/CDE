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
    .factory('CdesInForm', function($resource) {
        var CdesInForm = $resource('/cdesinform/:formId', {formId: '@formId'}, 
            {'getCdes': {method: 'GET', isArray: true}});
        return CdesInForm;
    })
    .factory('AutocompleteSvc', function($resource) {
        var AutocompleteSvc = $resource("/autocomplete");
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
        var Form = $resource('/form/:formId', {formId: '@formId'});
        return Form;
    })
    .factory('FormList', function($resource) {
        var FormList = $resource('/formlist');
        return FormList;
    })
    .factory('CdesForApproval', function($resource) {
        var R = $resource('/cdesforapproval');
        return R;
    })
    .factory('MyCart', function($resource) {
        var MyCart = $resource('/cartcontent');
        return MyCart;
    })
    .factory("AddToCart", function($resource) {
        var AddToCart = $resource(
                "/addtocart/:formId", 
                {formId: '@formId'}, 
                {add: {method: 'POST'}}
            );
        return AddToCart;
    })
    .factory("AddCdeToForm", function($resource) {
        var AddCdeToForm = $resource(
                "/addcdetoform/:cdeId/:formId", 
                {formId: '@formId', cdeId: '@cdeId'}, 
                {add: {method: 'POST'}}
            );
        return AddCdeToForm;
    })
    .factory("RemoveFromCart", function($resource) {
        var RemoveFromCart = $resource(
                "/removefromcart/:formId", 
                {formId: '@formId'}, 
                {add: {method: 'POST'}}
            );
        return RemoveFromCart;
    })
    .factory('Myself', function($resource) {
        var Myself = $resource('/user/me');
        return Myself;
    })
    ;