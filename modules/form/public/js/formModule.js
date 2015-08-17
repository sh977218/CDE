angular.module('formModule', ['resourcesForm', 'ngRoute'])
    .config(function($routeProvider) {
        $routeProvider.
            when('/form/search', {controller: 'FormListCtrl', templateUrl: '/template/system/list', title: "Find protocol forms", keywords: 'form, protocol, protocol form, crf, case report form, repository', description: 'Repository of Protocol Forms and Common Data Elements. Search Forms and CDEs.'}).
            when('/createForm', {controller: 'CreateFormCtrl', templateUrl: '/template/form/createForm'}).
            when('/formView', {controller: 'FormViewCtrl', templateUrl: '/template/form/formView'});
    });