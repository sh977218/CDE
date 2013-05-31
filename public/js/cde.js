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
        template: '<div >' + 
                        '<div ng-hide="editMode">' + 
                            '<i ng-show="isAllowed()" class="icon-pencil" ng-click="value=model; editMode=true"></i> {{model}}' + 
                        '</div>' + 
                        '<div ng-show="editMode">' + 
                            '<input type="text" ng-model="value" />' + 
                            '<button class="icon-ok" ng-click="model = value; editMode = false; onOk()"/>' + 
                            '<button class="icon-remove" ng-click="editMode = false"/>' +
                        '</div>' +       
                    '</div>'
                ,
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
        template: '<div>' + 
                        '<div ng-hide="editMode">' + 
                         '   <i ng-show="isAllowed()" class="icon-pencil" ng-click="value=model; editMode=true"></i> {{model}}' +
                        '</div>' + 
                        '<div ng-show="editMode">' + 
                         '   <textarea ng-model="value" ></textarea>' + 
                          '  <button class="icon-ok" ng-click="model = value;editMode = false; onOk()"/>' + 
                           ' <button class="icon-remove" ng-click="editMode = false"/>' + 
                        '</div>       ' + 
                    '</div>',
        restrict: 'E',
        scope: {
            model: '='
            , isAllowed: '&'
            , onOk: '&'
        }
    };
    });