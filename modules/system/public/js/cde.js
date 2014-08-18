var cdeApp = angular.module('cde', ['resources', 'ngGrid', 'ui.bootstrap', 'ngSanitize', 'ngRoute', 'textAngular', 'LocalStorageModule', 'matchMedia']).
    config(function($routeProvider) {
        $routeProvider.
        when('/', {controller: HomeCtrl, templateUrl:'/home'}).
        when('/search', {controller: DEListCtrl, templateUrl:'/list'}).
        when('/login', {controller: AuthCtrl, templateUrl:'/login'}).
        when('/signup', {controller: AuthCtrl, templateUrl:'/signup'}).
        when('/createCde', {controller: CreateCdeCtrl, templateUrl:'/createcde'}).
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
        when('/siteAudit', {controller: SiteAuditCtrl, templateUrl: '/siteaudit'}).
        when('/quickBoard', {controller: QuickBoardCtrl, templateUrl: '/quickBoard'}).
        when('/sdcview', {controller: SDCViewCtrl, templateUrl: '/sdcView'}).
        when('/formList', {controller: FormListCtrl, templateUrl: '/template/form/list'}).
        when('/createForm', {controller: CreateFormCtrl, templateUrl: '/template/form/createForm'}).
        when('/formView', {controller: FormViewCtrl, templateUrl: '/template/form/formView'}).
        otherwise({redirectTo:'/'});
    })
    .directive('inlineEdit', function() {
    return {
        template: '<span>' + 
                        '<span ng-hide="editMode">' + 
                            '<i ng-show="isAllowed()" class="fa fa-edit" ng-click="value=model; editMode=true"></i> {{model | placeholdEmpty}}' + 
                        '</span>' + 
                        '<span ng-show="editMode">' +                                            
                            '<input type="text" ng-model="value" typeahead="name for name in [].concat(typeaheadSource) | filter:$viewValue | limitTo:8" class="form-control typeahead"/>' +                                                        
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
                            '   <i ng-show="isAllowed()" class="fa fa-edit" ng-click="value=model; editMode=true"></i>' +
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
    
    isAllowedModel.isAllowed = function ($scope, CuratedItem) {
        if (!CuratedItem) return false;
        if ($scope.initialized && CuratedItem.archived) {
            return false;
        }
        if ($scope.user.siteAdmin) {
            return true;
        } else {   
            if ($scope.initialized && 
                    ((CuratedItem.registrationState.registrationStatus === "Standard" || CuratedItem.registrationState.registrationStatus === "Preferred Standard") )) {
                return false;
            }
            if ($scope.initialized && $scope.myOrgs) {
                return $scope.myOrgs.indexOf(CuratedItem.stewardOrg.name) > -1;
            } else {
                return false;
            }
        }
    };

    isAllowedModel.displayStatusWarning = function($scope, CuratedItem) {
        if(!CuratedItem) return false;
        if(($scope.initialized && CuratedItem.archived) || $scope.user.siteAdmin) {
            return false;
        } else {
            if ($scope.initialized && $scope.myOrgs) {
                return ($scope.myOrgs.indexOf(CuratedItem.stewardOrg.name) > -1) && (CuratedItem.registrationState.registrationStatus === "Standard" || CuratedItem.registrationState.registrationStatus === "Preferred Standard");
            } else {
                return false;
            }
        }
    };
    
    return isAllowedModel;
});

cdeApp.directive('diff', function () {
    return {
        restrict: 'AE'
        , scope: {
            values: '='
        }
        , templateUrl: '/propertyDiff.html'
        , controller: function($scope) {
            $scope.renderValue = function(value){
                var output = "";
                for (prop in value) {
                    if (prop === "$$hashKey") continue;
                    var v = value[prop];
                    if (v) {
                        if (output !== "") output += ", ";
                        output += v;
                    }                        
                }
                return output;
            };
        }
    };
});

cdeApp.config(['$compileProvider', function($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:text\//);
}]);
