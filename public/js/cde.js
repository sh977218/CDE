var cdeApp = angular.module('cde', ['resources', 'ui.bootstrap', 'ngSanitize']).
    config(function($routeProvider) {
        $routeProvider.
        when('/edit/:cdeId', {controller:EditCtrl, templateUrl:'detail.html'}).
        when('/', {controller:DEListCtrl, templateUrl:'/list'}).
        when('/login', {controller:AuthCtrl, templateUrl:'/login'}).
        when('/signup', {controller:AuthCtrl, templateUrl:'/signup'}).
        when('/createCde', {controller:CreateCdeCtrl, templateUrl:'/createcde'}).
        when('/listforms', {controller: ListFormsCtrl, templateUrl: '/listforms'}).
        when('/createform', {controller: CreateFormCtrl, templateUrl: '/createform'}).
        when('/formview', {controller: FormViewCtrl, templateUrl: '/formview'}).
        when('/deview', {controller: DEViewCtrl, templateUrl: '/deview'}).
        when('/cart', {controller: CartCtrl, templateUrl: '/cart'}).
        when('/nlmreleased', {controller: NlmReleaseCtrl, templateUrl: '/cdereview'}).
        when('/internalreview', {controller: InternalReviewCtrl, templateUrl: '/cdereview'}).
        when('/siteaccountmanagement', {controller: AccountManagementCtrl, templateUrl: '/siteaccountmanagement'}).
        when('/orgaccountmanagement', {controller: AccountManagementCtrl, templateUrl: '/orgaccountmanagement'}).
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

cdeApp.directive('ngCdeAvailable', ['$http', function($http) {
  return {
    require: 'ngModel',
    link: function(scope, ele, attrs, ctrl) {
      scope.$watch(attrs.ngModel, function() {
        $http({
          method: 'GET',
          url: '/dataelement/' + scope.cde.uuid + "/" + scope.cde.version
        }).success(function(data, status, headers, cfg) {
            console.log(data);
            console.log(data == "")
          ctrl.$setValidity('unique', data == "");
        }).error(function(data, status, headers, cfg) {
          ctrl.$setValidity('unique', false);
        });
      });
    }
  };
}]);