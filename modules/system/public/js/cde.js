var cdeApp = angular.module('cde', ['resources', 'classification', 'ngGrid', 'ui.bootstrap', 'ngSanitize', 'ngRoute', 'textAngular', 'LocalStorageModule', 'matchMedia', 'ui.sortable', 'ui.scrollfix', 'ui.select']).
    config(function($routeProvider) {
        $routeProvider.
        when('/', {controller: HomeCtrl, templateUrl:'/home'}).
        when('/cde/search', {controller: DEListCtrl, templateUrl: 'template/system/list'}).
        when('/login', {controller: AuthCtrl, templateUrl:'/login'}).
        when('/signup', {controller: AuthCtrl, templateUrl:'/signup'}).
        when('/createCde', {controller: CreateCdeCtrl, templateUrl:'/createcde'}).
        when('/deview', {controller: DEViewCtrl, templateUrl: '/deview'}).
        when('/siteaccountmanagement', {controller: AccountManagementCtrl, templateUrl: '/siteaccountmanagement'}).
        when('/orgaccountmanagement', {controller: AccountManagementCtrl, templateUrl: '/orgaccountmanagement'}).
        when('/classificationmanagement', {controller: ClassificationManagementCtrl, templateUrl: '/template/system/classificationManagement'}).
        when('/profile', {controller: ProfileCtrl, templateUrl: '/profile'}).
        when('/myboards', {controller: MyBoardsCtrl, templateUrl: '/myboards'}).
        when('/board/:boardId', {controller: BoardViewCtrl, templateUrl: '/board'}).
        when('/boardList', {controller: BoardListCtrl, templateUrl: '/boardList'}).
        when('/cdeSearchExport', {controller: DEListCtrl, templateUrl: '/exportCdeSearch'}).
        when('/boardExport/:boardId', {controller: ExportCtrl, templateUrl: '/cde/public/html/boardExport.html'}).
        when('/inbox', {controller: InboxCtrl, templateUrl: '/mail/template/inbox'}).
        when('/siteAudit', {controller: SiteAuditCtrl, templateUrl: '/siteaudit'}).
        when('/quickBoard', {controller: QuickBoardCtrl, templateUrl: '/quickBoard'}).
        when('/sdcview', {controller: SDCViewCtrl, templateUrl: '/sdcView'}).
        when('/form/search', {controller: FormListCtrl, templateUrl: '/template/system/list'}).
        when('/createForm', {controller: CreateFormCtrl, templateUrl: '/template/form/createForm'}).
        when('/formView', {controller: FormViewCtrl, templateUrl: '/template/form/formView'}).
        otherwise({redirectTo:'/'});
    })
    .directive('inlineEdit', function() {
    return {
        template: '<span>' + 
                        '<span ng-hide="editMode">' + 
                            '<i tabindex="0" title="Edit" role="link" ng-show="isAllowed()" class="fa fa-edit" ng-click="value=model; editMode=true"></i> {{model | placeholdEmpty}}' + 
                        '</span>' + 
                        '<form name="inlineForm" ng-show="editMode">' + 
                            '<input name="inlineInput" type="{{inputType}}" ng-model="value" typeahead="name for name in [].concat(typeaheadSource) | filter:$viewValue | limitTo:8" class="form-control typeahead"/>' +                                                        
                            '<button class="btn btn-default btn-sm fa fa-check" ng-click="model = value;editMode = false; onOk();" ng-disabled="!inlineForm.inlineInput.$valid"> Confirm</button>' + 
                            '<button class="btn btn-default btn-sm fa fa-times" ng-click="editMode = false"> Discard</button>' + 
                        '</form>' +       
                    '</span>'
                ,
        restrict: 'AE',
        scope: {
            model: '='
            , inputType: '=?'
            , isAllowed: '&'
            , onOk: '&'
            , typeaheadSource: '='
        }, 
        controller: function($scope){
            $scope.inputType = $scope.inputType || 'text';
        }
    };
    })
    .directive('inlineAreaEdit', function() {
        return {
            template: '<div>' + 
                            '<div ng-hide="editMode" ng-switch="defFormat">' + 
                            '   <i tabindex="0" title="Edit" role="link" ng-show="isAllowed()" class="fa fa-edit" ng-click="value=model; editMode=true"></i>' +
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
        if (CuratedItem.archived) {
            return false;
        }
        if ($scope.user.siteAdmin) {
            return true;
        } else {   
            if (CuratedItem.registrationState.registrationStatus === "Standard" || CuratedItem.registrationState.registrationStatus === "Preferred Standard") {
                return false;
            }
            if ($scope.myOrgs) {
                return exports.isCuratorOf($scope.user, CuratedItem.stewardOrg.name);
            } else {
                return false;
            }
        }
    };
    
    isAllowedModel.setCanCurate = function($scope) {
        isAllowedModel.runWhenInitialized($scope, function() {
            $scope.canCurate = isAllowedModel.isAllowed($scope, $scope.elt);
        });
    };
    
    isAllowedModel.runWhenInitialized = function($scope, toRun) {
        if (!$scope.userLoaded) {
            $timeout(isAllowedModel.runWhenInitialized($scope, toRun), 1000);
        } else {
            toRun($scope);
        }                
    };
    
    isAllowedModel.setDisplayStatusWarning = function($scope) {
        isAllowedModel.runWhenInitialized($scope, function() {
            $scope.displayStatusWarning = isAllowedModel.displayStatusWarning($scope, $scope.elt);
        });    
    };
    
    isAllowedModel.displayStatusWarning = function($scope, CuratedItem) {
        if(!CuratedItem) return false;
        if(CuratedItem.archived || $scope.user.siteAdmin) {
            return false;
        } else {
            if ($scope.myOrgs) {
                return exports.isCuratorOf($scope.user, CuratedItem.stewardOrg.name) && (CuratedItem.registrationState.registrationStatus === "Standard" || CuratedItem.registrationState.registrationStatus === "Preferred Standard");
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

cdeApp.config(function($provide) {
    $provide.decorator('uiSortableDirective', function($delegate) {
        var directive = $delegate[0];
        var link = directive.link;
        directive.compile = function() {
          return function(scope, element, attrs, ngModel) {
              if (scope.dragEnabled) {
                  link(scope, element, attrs, ngModel);
              }
            };
        };
        return $delegate;
    });
});

angular.module("template/accordion/accordion-group.html", []).run(["$templateCache", function($templateCache) {
	  $templateCache.put("template/accordion/accordion-group.html",
	    "<div class=\"panel panel-default\">\n" +
	    "  <div class=\"panel-heading\">\n" +
	    "    <h4 class=\"panel-title\">\n" +
	    "      <a tabindex=\"-1\" class=\"accordion-toggle\" ng-click=\"isOpen = !isOpen\" accordion-transclude=\"heading\">{{heading}}</a>\n" +
	    "    </h4>\n" +
	    "  </div>\n" +
	    "  <div class=\"panel-collapse\" collapse=\"!isOpen\">\n" +
	    "	  <div class=\"panel-body\" ng-transclude></div>\n" +
	    "  </div>\n" +
	    "</div>");
	}]);

angular.module("template/pagination/pager.html", []).run(["$templateCache", function($templateCache) {
	  $templateCache.put("template/pagination/pager.html",
	    "<ul class=\"pager\">\n" +
	    "  <li ng-repeat=\"page in pages\" ng-class=\"{disabled: page.disabled, previous: page.previous, next: page.next}\"><a tabindex=\"0\" ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
	    "</ul>");
	}]);

angular.module("template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
	  $templateCache.put("template/pagination/pagination.html",
	    "<ul class=\"pagination\">\n" +
	    "  <li ng-repeat=\"page in pages\" ng-class=\"{active: page.active, disabled: page.disabled}\"><a tabindex=\"0\" ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
	    "</ul>");
	}]);

angular.module("template/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
	  $templateCache.put("template/tabs/tab.html",
	    "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
	    "  <a tabindex=\"0\" ng-click=\"select()\" tab-heading-transclude>{{heading}}</a>\n" +
	    "</li>\n" +
	    "");
	}]);
    
cdeApp.factory('$exceptionHandler', function($injector) {
    return function(exception) {
        var http;
        if (!http) { http = $injector.get('$http'); }
        try {
            http.post('/logClientException', {stack: exception.stack, message: exception.message, name: exception.name});
        } catch (e) {
            
        }
        throw exception;
    };
});    