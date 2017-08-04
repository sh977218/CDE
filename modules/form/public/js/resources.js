angular.module('resourcesForm', ['ngResource'])
    .factory('Form', ["$resource", function ($resource) {
        return $resource('/form/:formId', {formId: '@formId'}, {
            update: {method: 'PUT'},
            save: {method: 'POST', params: {type: null}}
        });
    }])
    .factory('CdesInForm', ["$resource", function ($resource) {
        return $resource('/cdesinform/:formId', {formId: '@formId'},
            {'getCdes': {method: 'GET', isArray: true}});
    }]);