angular.module('formModule', ['resourcesForm', 'ngRoute']).config(function($routeProvider)
{
    $routeProvider.
        when('/form/search', {
            controller: 'ListCtrl',
            subCtrl: 'FormListCtrl',
            templateUrl: '/system/public/html/list.html',
            title: "Find protocol forms",
            keywords: 'form, protocol, protocol form, crf, case report form, repository',
            description: 'Repository of Protocol Forms and Common Data Elements. Search Forms and CDEs.'
        }).
        when('/createForm', {controller: 'CreateFormCtrl', templateUrl: '/form/public/html/createForm.html'}).
        when('/formView', {controller: 'FormViewCtrl', templateUrl: '/form/public/html/formView.html'});
});