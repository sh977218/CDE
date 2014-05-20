var cdeApp = angular.module('cde', ['resources', 'ngGrid', 'ui.bootstrap', 'ngSanitize', 'ngRoute', 'textAngular']).
    config(function($routeProvider) {
        $routeProvider.
        when('/', {controller:DEListCtrl, templateUrl:'/list'}).
        when('/login', {controller:AuthCtrl, templateUrl:'/login'}).
        when('/signup', {controller:AuthCtrl, templateUrl:'/signup'}).
        when('/createCde', {controller:CreateCdeCtrl, templateUrl:'/createcde'}).
        when('/deview', {controller: DEViewCtrl, templateUrl: '/deview'}).
        when('/siteaccountmanagement', {controller: AccountManagementCtrl, templateUrl: '/siteaccountmanagement'}).
        when('/orgaccountmanagement', {controller: AccountManagementCtrl, templateUrl: '/orgaccountmanagement'}).
        when('/classificationmanagement', {controller: ClassificationManagementCtrl, templateUrl: '/classificationmanagement'}).
        when('/profile', {controller: AccountManagementCtrl, templateUrl: '/profile'}).
        when('/myboards', {controller: MyBoardsCtrl, templateUrl: '/myboards'}).
        when('/board/:boardId', {controller: BoardViewCtrl, templateUrl: '/board'}).
        when('/boardList', {controller: BoardListCtrl, templateUrl: '/boardList'}).
        when('/deCompare', {controller: CompareCtrl, templateUrl: '/deCompare'}).
        when('/cdeSearchExport', {controller: DEListCtrl, templateUrl: '/exportCdeSearch'}).
        when('/inbox', {controller: InboxCtrl, templateUrl: '/mail/template/inbox'}).
        otherwise({redirectTo:'/'});
    }).
    directive('inlineEdit', function() {
    return {
        template: '<span>' + 
                        '<span ng-hide="editMode">' + 
                            '<i ng-show="isAllowed()" class="fa fa-edit" ng-click="value=model; editMode=true"></i> {{model | placeholdEmpty}}' + 
                        '</span>' + 
                        '<span ng-show="editMode">' +                         
                            '<input ng-hide="typeaheadSource.length>0" type="text" ng-model="value" class="form-control"/>' + 
                            '<input ng-show="typeaheadSource.length>0" type="text" ng-model="value" typeahead="name for name in typeaheadSource | filter:$viewValue | limitTo:8" class="form-control typeahead"/>' +                                                        
                            '<button class="fa fa-check" ng-click="model = value;editMode = false; onOk();"> Confirm</button>' + 
                            '<button class="fa fa-times" ng-click="editMode = false"> Discard</button>' + 
                        '</span>' +       
                    '</span>'
                ,
        restrict: 'AE',
        scope: {
            model: '='
            , isAllowed: '&'
            , onOk: '&'
            , typeaheadSource: '='
        }
    };
    })
    .directive('inlineAreaEdit', function() {
        return {
            template: '<div>' + 
                            '<div ng-hide="editMode" ng-switch="defFormat">' + 
                            '   <i ng-show="isAllowed()" class="fa fa-edit" ng-click="value=model; editMode=true"></i>&nbsp;' +
                            '   <span ng-switch-default><span ng-bind="model"></span></span>' +
                            '   <span ng-switch-when="html"><span ng-bind-html="model"></span></span>' +
                            '</div>' + 
                            '<div ng-show="editMode">' + 
                            '   <div class="btn-group definitionFormatRadio">' +
                            '       <button type="button" class="btn btn-default btn-xs" ng-model="defFormat" btn-radio="null">Plain Text</button>' +
                            '       <button type="button" class="btn btn-default btn-xs" ng-model="defFormat" btn-radio="\'html\'">Rich Text</button>' +
                            '   </div>' +                            
                            '   <textarea ng-show="defFormat!=\'html\'" ng-model="value" class="form-control"></textarea>' +  
                            '   <div text-angular ng-show="defFormat==\'html\'" ng-model="value" ta-toolbar-group-class="btn-group btn-group-sm" ></div>' +                             
                            '   <button class="fa fa-check" ng-click="model = value;editMode = false; onOk();">Confirm</button>' + 
                            '   <button class="fa fa-times" ng-click="editMode = false">Cancel</button>' + 
                            '</div>       ' + 
                        '</div>',
            restrict: 'AE',
            scope: {
                model: '='
                , isAllowed: '&'
                , onOk: '&'
                , defFormat: '='
                , inlineAreaVisibility: '='
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
        if (!(input === undefined || input === null || input === "")) {
            return input;
        } else {
            return "N/A";
        }
    };
});

cdeApp.filter('bytes', function() {
    return function(bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                    number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    };
});

cdeApp.factory('isAllowedModel', function () {
    var isAllowedModel = {
    };
    
    isAllowedModel.isAllowed = function ($scope, cde) {
        if (!cde) return false;
        if ($scope.initialized && cde.archived) {
            return false;
        }
        if ($scope.user.siteAdmin) {
            return true;
        } else {   
            if ($scope.initialized && 
                    ((cde.registrationState.registrationStatus === "Standard" || cde.registrationState.registrationStatus === "Standard") )) {
                return false;
            }
            if ($scope.initialized && $scope.myOrgs) {
                return $scope.myOrgs.indexOf(cde.stewardOrg.name) > -1;
            } else {
                return false;
            }
        }
    };
    
    return isAllowedModel;
});