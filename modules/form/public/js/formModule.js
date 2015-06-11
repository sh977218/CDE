angular.module('formModule', ['resourcesForm', 'ngRoute'])
    .config(function($routeProvider) {
        $routeProvider.
            when('/form/search', {controller: 'FormListCtrl', templateUrl: '/template/system/list'}).
            when('/createForm', {controller: 'CreateFormCtrl', templateUrl: '/template/form/createForm'}).
            when('/formView', {controller: 'FormViewCtrl', templateUrl: '/template/form/formView'});
    });