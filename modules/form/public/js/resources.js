angular.module('resourcesForm', ['ngResource'])
    .factory('Form', ["$resource", function ($resource) {
        return $resource('/form/:formId', {formId: '@formId'}, {
            update: {method: 'PUT'},
            save: {method: 'POST', params: {type: null}}
        });
    }]);