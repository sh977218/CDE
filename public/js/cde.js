var cdeApp = angular.module('cde', ['resources', 'ui.bootstrap']).
    config(function($routeProvider) {
        $routeProvider.
        when('/edit/:cdeId', {controller:EditCtrl, templateUrl:'detail.html'}).
        when('/', {controller:ListCtrl, templateUrl:'/list'}).
        when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
        when('/listforms', {controller: ListFormsCtrl, templateUrl: '/listforms'}).
        when('/createform', {controller: CreateFormCtrl, templateUrl: '/createform'}).
        when('/formview', {controller: FormViewCtrl, templateUrl: '/formview'}).
        when('/cart', {controller: CartCtrl, templateUrl: '/cart'}).
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