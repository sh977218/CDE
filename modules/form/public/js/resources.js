angular.module('resourcesForm', ['ngResource'])
.factory('Form', function($resource) {
    return $resource('/form/:formId', {formId: '@formId'}, {update: {method: 'PUT'}, save: {method: 'POST', params: {type: null} }});
})
.factory('CdesInForm', function($resource) {
    return $resource('/cdesinform/:formId', {formId: '@formId'}, 
        {'getCdes': {method: 'GET', isArray: true}});
})
;    