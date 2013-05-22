var cdeApp = angular.module('cde', ['resources', 'ui.bootstrap']).
    config(function($routeProvider) {
        $routeProvider.
        when('/edit/:cdeId', {controller:EditCtrl, templateUrl:'detail.html'}).
        when('/', {controller:ListCtrl, templateUrl:'/list'}).
        when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
        otherwise({redirectTo:'/'});
    }).
    directive('inlineEdit', function() {
    return {
        templateUrl: '/inlineText',
        restrict: 'E',
        scope: {
            model: '='
            , isAllowed: '&'
            , onOk: '&'
        }
    };
    }).
    directive('inlineAreaEdit', function() {
    return {
        templateUrl: '/inlineTextArea',
        restrict: 'E',
        scope: {
            model: '='
            , isAllowed: '&'
            , onOk: '&'
        }
    };
    });