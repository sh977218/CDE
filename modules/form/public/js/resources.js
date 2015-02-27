angular.module('formModule', ['resourcesForm', 'ngRoute'])
.config(function($routeProvider) {
    $routeProvider.
    when('/form/search', {controller: 'FormListCtrl', templateUrl: '/template/system/list'}).
    when('/createForm', {controller: 'CreateFormCtrl', templateUrl: '/template/form/createForm'}).
    when('/formView', {controller: 'FormViewCtrl', templateUrl: '/template/form/formView'});
});
angular.module('resourcesForm', ['ngResource'])
.factory('Form', function($resource) {
    return $resource('/form/:formId', {formId: '@formId'}, {update: {method: 'PUT'}, save: {method: 'POST', params: {type: null} }});
})
.factory('CdesInForm', function($resource) {
    return $resource('/cdesinform/:formId', {formId: '@formId'}, 
        {'getCdes': {method: 'GET', isArray: true}});
})
;    