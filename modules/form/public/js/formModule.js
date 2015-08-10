angular.module('formModule', ['resourcesForm', 'ngRoute'])
    .config(function($routeProvider) {
        $routeProvider.
            when('/form/search', {controller: 'FormListCtrl', templateUrl: '/system/public/html/list.html'}).
            when('/createForm', {controller: 'CreateFormCtrl', templateUrl: '/form/public/html/createForm.html'}).
            when('/formView', {controller: 'FormViewCtrl', templateUrl: '/form/public/html/formView.html'});
    });