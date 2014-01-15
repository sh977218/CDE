var cdeApp = angular.module('cde', ['resources', 'ui.bootstrap', 'ngSanitize', 'ngRoute', 'textAngular']).
    config(function($routeProvider) {
        $routeProvider.
        when('/', {controller:DEListCtrl, templateUrl:'/list'}).
        when('/login', {controller:AuthCtrl, templateUrl:'/login'}).
        when('/signup', {controller:AuthCtrl, templateUrl:'/signup'}).
        when('/createCde', {controller:CreateCdeCtrl, templateUrl:'/createcde'}).
        when('/listforms', {controller: ListFormsCtrl, templateUrl: '/listforms'}).
        when('/createform', {controller: CreateFormCtrl, templateUrl: '/createform'}).
        when('/formview', {controller: FormViewCtrl, templateUrl: '/formview'}).
        when('/deview', {controller: DEViewCtrl, templateUrl: '/deview'}).
        when('/cart', {controller: CartCtrl, templateUrl: '/cart'}).
        when('/siteaccountmanagement', {controller: AccountManagementCtrl, templateUrl: '/siteaccountmanagement'}).
        when('/orgaccountmanagement', {controller: AccountManagementCtrl, templateUrl: '/orgaccountmanagement'}).
        when('/profile', {controller: AccountManagementCtrl, templateUrl: '/profile'}).
        when('/myboards', {controller: MyBoardsCtrl, templateUrl: '/myboards'}).
        when('/board/:boardId', {controller: BoardViewCtrl, templateUrl: '/board'}).
        when('/boardList', {controller: BoardListCtrl, templateUrl: '/boardList'}).
        otherwise({redirectTo:'/'});
    }).
    directive('inlineEdit', function() {
    return {
        template: '<span >' + 
                        '<span ng-hide="editMode">' + 
                            '<i ng-show="isAllowed()" class="fa fa-edit" ng-click="value=model; editMode=true"></i> {{model | placeholdEmpty}}' + 
                        '</span>' + 
                        '<span ng-show="editMode">' + 
                            '<input type="text" ng-model="value" />' + 
                            '<i class="fa fa-check-square-o" ng-click="model = value; editMode = false; onOk()"> </i>&nbsp;' + 
                            '<i class="fa fa-trash-o" ng-click="editMode = false"></i>' +
                        '</span>' +       
                    '</span>'
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
                         '   <i ng-show="isAllowed()" class="fa fa-edit" ng-click="value=model; editMode=true"></i>&nbsp;<span ng-bind-html="model"/>' +
                        '</div>' + 
                        '<div ng-show="editMode">' + 
                         '   <textarea ng-model="value" ></textarea>' + 
                          '  <i class="fa fa-check-square-o" ng-click="model = value;editMode = false; onOk()"> </i>' + 
                           ' <i class="fa fa-trash-o" ng-click="editMode = false"></i>' + 
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

cdeApp.directive('ngCdeAvailable', ['$http', function($http) {
  return {
    require: 'ngModel',
    link: function(scope, ele, attrs, ctrl) {
      scope.$watch(attrs.ngModel, function() {
            $http({
              method: 'GET',
              url: '/debyuuid/' + scope.cde.uuid + "/" + scope.cde.version
            }).success(function(data, status, headers, cfg) {
              ctrl.$setValidity('unique', data == "");
            }).error(function(data, status, headers, cfg) {
              ctrl.$setValidity('unique', false);
            });
      });
    }
  };
}]);

cdeApp.filter('placeholdEmpty', function() {
    return function(input) {
        if (!(input == undefined || input == null || input == "")) {
            return input;
        } else {
            return "N/A";
        }
    };
});