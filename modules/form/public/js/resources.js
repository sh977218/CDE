angular.module('resourcesForm', ['ngResource'])
    .factory('Form', function ($resource) {
        return $resource('/form/:formId', {formId: '@formId'}, {
            update: {method: 'PUT'},
            save: {method: 'POST', params: {type: null}}
        });
    })
    .factory('CdesInForm', function ($resource) {
        return $resource('/cdesinform/:formId', {formId: '@formId'},
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('PriorForms', function ($resource) {
        return $resource('/priorforms/:formId', {formId: '@formId'},
            {'getForms': {method: 'GET', isArray: true}});
    })
;    