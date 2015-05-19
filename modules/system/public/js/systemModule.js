angular.module('systemModule', ['ElasticSearchResource', 'resourcesSystem', 'formModule', 'cdeModule', 'articleModule',
                'OrgFactories','classification', 'ngGrid',
                'ui.bootstrap', 'ngSanitize', 'ngRoute', 'textAngular', 'LocalStorageModule', 'matchMedia', 'ui.sortable',
                'ui.scrollfix', 'ui.select', 'camelCaseToHuman', 'yaru22.angular-timeago', 'angularFileUpload', 'ngTextTruncate']).
    config(function($routeProvider) {
        $routeProvider.
        when('/', {redirectTo: function(){
                if (!window.loggedIn) return "/home";
                return "/cde/search"
        }}).
        when('/home', {controller: 'HomeCtrl', templateUrl:'/system/public/html/home.html'}).
        when('/login', {controller: 'AuthCtrl', templateUrl:'/login'}).
        when('/signup', {controller: 'AuthCtrl', templateUrl:'/signup'}).
        when('/siteAudit', {templateUrl: '/siteaudit'}).
        when('/inbox', {controller: 'InboxCtrl', templateUrl: '/system/public/html/inbox.html'}).
        when('/siteaccountmanagement', {controller: 'AccountManagementCtrl', templateUrl: '/siteaccountmanagement'}).
        when('/orgaccountmanagement', {controller: 'AccountManagementCtrl', templateUrl: '/orgaccountmanagement'}).
        when('/classificationmanagement', {controller: 'ClassificationManagementCtrl', templateUrl: '/template/system/classificationManagement'}).
        when('/profile', {controller: 'ProfileCtrl', templateUrl: '/profile'}).
        when('/triggerClientException', {controller: 'TriggerClientExceptionCtrl', templateUrl: '/template/system/triggerClientException'}).
        when('/searchSettings', {controller: 'SearchSettingsCtrl', templateUrl: '/system/public/html/searchSettings.html'}).
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
                            '   <span ng-switch-default><span ng-bind="model" ng-text-truncate="model" ng-tt-threshold="500"></span></span>' +
                            '   <span ng-switch-when="html"><span ng-bind-html="model" ng-text-truncate="model" ng-tt-threshold="500"></span></span>' +
                            '</div>' +
                            '<div ng-show="editMode">' +
                            '   <div class="btn-group definitionFormatRadio">' +
                            '       <button type="button" class="btn btn-default btn-xs" ng-model="defFormat" btn-radio="null">Plain Text</button>' +
                            '       <button type="button" class="btn btn-default btn-xs" ng-model="defFormat" btn-radio="\'html\'">Rich Text</button>' +
                            '   </div>' +
                            '   <textarea ng-show="defFormat!=\'html\'" ng-model="value" class="form-control"></textarea>' +
                            '   <div text-angular ng-show="defFormat==\'html\'" ng-model="value" ta-toolbar-group-class="btn-group btn-group-sm" ta-toolbar="[[\'h1\',\'h2\',\'h3\',\'h4\',\'h5\',\'h6\',\'p\'],[\'bold\',\'italics\'],[\'undo\',\'redo\'],[\'ul\',\'ol\'],[\'justifyLeft\',\'justifyCenter\',\'justifyRight\'],[\'indent\',\'outdent\']]"></div>' +
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

angular.module('systemModule').filter('placeholdEmpty', function() {
    return function(input) {
        if (!(input === undefined || input === null || input === "")) {
            return input;
        } else {
            return "N/A";
        }
    };
});

angular.module('systemModule').filter('truncateLongUserName', function() {
    return function(input) {
        if (!(input === undefined || input === null || input === "")) {
            if(input.length > 17){
                return input.substr(0,17)+'...';
            }
            else return input;
        } else {
            return "N/A";
        }
    };
});

angular.module('systemModule').filter('bytes', function() {
    return function(bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 1;
            var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
                    number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    };
});

angular.module('systemModule').factory('isAllowedModel', function (userResource) {
    var isAllowedModel = {
    };

    isAllowedModel.isAllowed = function ($scope, CuratedItem) {
        if (!CuratedItem) return false;
        if (CuratedItem.archived) {
            return false;
        }
        if (userResource.user.siteAdmin) {
            return true;
        } else {
            if (CuratedItem.registrationState.registrationStatus === "Standard" || CuratedItem.registrationState.registrationStatus === "Preferred Standard") {
                return false;
            }
            if (userResource.userOrgs) {
                return exports.isCuratorOf(userResource.user, CuratedItem.stewardOrg.name);
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
        userResource.getPromise().then(toRun);
    };

    isAllowedModel.setDisplayStatusWarning = function($scope) {
        isAllowedModel.runWhenInitialized($scope, function() {
            $scope.displayStatusWarning = isAllowedModel.displayStatusWarning($scope, $scope.elt);
        });
    };

    isAllowedModel.displayStatusWarning = function($scope, CuratedItem) {
        if(!CuratedItem) return false;
        if(CuratedItem.archived || userResource.user.siteAdmin) {
            return false;
        } else {
            if (userResource.userOrgs) {
                return exports.isCuratorOf(userResource.user, CuratedItem.stewardOrg.name) && (CuratedItem.registrationState.registrationStatus === "Standard" || CuratedItem.registrationState.registrationStatus === "Preferred Standard");
            } else {
                return false;
            }
        }
    };

    return isAllowedModel;
});

angular.module('systemModule').directive('diff', function () {
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

angular.module('systemModule').config(['$compileProvider', function($compileProvider) {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:text\//);
}]);

angular.module('systemModule').config(function($provide) {
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
    "  <li ng-class=\"{disabled: noPrevious(), previous: align}\"><a href tabindex=\"0\" ng-click=\"selectPage(page - 1)\">{{getText('previous')}}</a></li>\n" +
    "  <li ng-class=\"{disabled: noNext(), next: align}\"><a href ng-click=\"selectPage(page + 1)\">{{getText('next')}}</a></li>\n" +
    "</ul>");
}]);

angular.module("template/pagination/pagination.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/pagination/pagination.html",
    "<ul class=\"pagination\">\n" +
    "  <li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noPrevious()}\"><a href tabindex=\"0\" ng-click=\"selectPage(1)\">{{getText('first')}}</a></li>\n" +
    "  <li ng-if=\"directionLinks\" ng-class=\"{disabled: noPrevious()}\"><a href tabindex=\"0\" ng-click=\"selectPage(page - 1)\">{{getText('previous')}}</a></li>\n" +
    "  <li ng-repeat=\"page in pages track by $index\" ng-class=\"{active: page.active}\"><a href tabindex=\"0\" ng-click=\"selectPage(page.number)\">{{page.text}}</a></li>\n" +
    "  <li ng-if=\"directionLinks\" ng-class=\"{disabled: noNext()}\"><a href tabindex=\"0\" ng-click=\"selectPage(page + 1)\">{{getText('next')}}</a></li>\n" +
    "  <li ng-if=\"boundaryLinks\" ng-class=\"{disabled: noNext()}\"><a href tabindex=\"0\" ng-click=\"selectPage(totalPages)\">{{getText('last')}}</a></li>\n" +
    "</ul>");
}]);

angular.module("template/tabs/tab.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/tabs/tab.html",
    "<li ng-class=\"{active: active, disabled: disabled}\">\n" +
    "  <a href ng-click=\"select()\" tabindex=\"0\" tab-heading-transclude>{{heading}}</a>\n" +
    "</li>\n" +
    "");
}]);

angular.module('systemModule').config(function($provide) {
    $provide.decorator("$exceptionHandler", ['$delegate', '$injector', function($delegate, $injector) {
        var previousException;
        return function(exception, cause) {
            $delegate(exception, cause);
            if (previousException && exception.toString() === previousException.toString()) return;
            previousException = exception;
            var http;
            if (!http) { http = $injector.get('$http'); }
            try {
                if (exception.message.indexOf("[$compile:tpload]")>-1) return;
                http.post('/logClientException', {stack: exception.stack, message: exception.message, name: exception.name});
            } catch (e) {

            }
        };
    }]);
});

angular.module('systemModule').config(function (localStorageServiceProvider) {
    localStorageServiceProvider
        .setPrefix('nlmcde')
});
