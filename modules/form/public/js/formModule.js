angular.module('formModule', ['resourcesForm', 'ngRoute'])
    .config(function($routeProvider) {
        $routeProvider.
            when('/form/search', {controller: 'FormListCtrl', templateUrl: '/template/system/list', title: "NIH CDE Repository | Find protocol forms"}).
            when('/createForm', {controller: 'CreateFormCtrl', templateUrl: '/template/form/createForm'}).
            when('/formView', {controller: 'FormViewCtrl', templateUrl: '/template/form/formView'});
    });