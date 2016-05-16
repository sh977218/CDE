angular.module('systemModule', ['ElasticSearchResource', 'resourcesSystem', 'formModule', 'cdeModule', 'articleModule',
        'OrgFactories', 'classification', 'ngGrid',
        'ui.bootstrap', 'ngSanitize', 'ngRoute', 'textAngular', 'LocalStorageModule', 'matchMedia', 'ui.sortable',
        'ui.scrollfix', 'ui.select', 'camelCaseToHuman', 'yaru22.angular-timeago', 'angularFileUpload', 'ngTextTruncate'
        , 'angular-send-feedback', 'ngAnimate', 'ngDisplayObject', 'ngCompareSideBySide', 'lformsWidget', 'infinite-scroll'])
    .config(['$logProvider', function ($logProvider) {
        $logProvider.debugEnabled(window.debugEnabled);
    }])
    .config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode({enabled: true, requireBase: false});
        $routeProvider.when('/', {
            redirectTo: function () {
                if (!window.loggedIn) return "/home";
                return "/cde/search";
            }
        }).when('/home', {
            controller: 'HomeCtrl',
            templateUrl: '/system/public/html/home.html'
        }).when('/login', {
            controller: 'AuthCtrl',
            templateUrl: '/system/public/html/login.html'
        }).when('/siteAudit', {templateUrl: '/system/public/html/siteAudit.html'}).when('/inbox', {
            controller: 'InboxCtrl',
            templateUrl: '/system/public/html/inbox.html'
        }).when('/siteaccountmanagement', {
            controller: 'AccountManagementCtrl',
            templateUrl: '/system/public/html/siteAccountManagement.html'
        }).when('/orgaccountmanagement', {
            controller: 'AccountManagementCtrl',
            templateUrl: '/system/public/html/orgAccountManagement.html'
        }).when('/classificationmanagement', {
            controller: 'ClassificationManagementCtrl',
            templateUrl: '/system/public/html/classificationManagement.html'
        }).when('/orgauthority', {
            controller: 'AccountManagementCtrl',
            templateUrl: '/system/public/html/orgAuthority.html'
        }).when('/profile', {
            controller: 'ProfileCtrl',
            templateUrl: '/system/public/html/profile.html'
        }).when('/triggerClientException', {
            controller: 'TriggerClientExceptionCtrl',
            templateUrl: '/system/public/html/triggerClientException.html'
        }).when('/searchSettings', {
            controller: 'SearchSettingsCtrl',
            templateUrl: '/system/public/html/searchSettings.html'
        });
    })
    .run(["$templateCache", function ($templateCache) {
        $templateCache.put("/cde/public/templates/template1.html", "HELLO TEMPLATE");
    }])
    .directive('inlineEdit', function () {
        return {
            restrict: 'AE',
            scope: {
                model: '='
                , inputType: '=?'
                , isAllowed: '&'
                , onOk: '&'
                , typeaheadSource: '='
            },
            templateUrl: '/system/public/js/systemTemplate/inlineEdit.html',
            controller: function ($scope) {
                $scope.inputType = $scope.inputType || 'text';
            }
        };
    })
    .directive('inlineAreaEdit', function () {
        return {
            restrict: 'AE',
            scope: {
                model: '=',
                isAllowed: '&',
                onOk: '&',
                onErr: '&',
                defFormat: '=',
                inlineAreaVisibility: '='
            },
            controller: function ($scope, $element, $attrs) {
                $scope.clickEdit = function () {
                    $scope.inScope = {
                        value: $scope.model
                    };
                    $scope.editMode = true;
                };
                $scope.isInvalidHtml = function (html) {
                    var srcs = html.match(/src\s*=\s*["'](.+?)["']/ig);
                    if (srcs) {
                        for (var i = 0; i < srcs.length; i++) {
                            var src = srcs[i];
                            var urls = src.match(/\s*["'](.+?)["']/ig);
                            if (urls) {
                                for (var j = 0; j < urls.length; j++) {
                                    var url = urls[j].replace(/["]/g, "").replace(/[']/g, "");
                                    if (url.indexOf("/data/") !== 0 && url.indexOf(window.publicUrl + "/data/") !== 0) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    return false;
                };
                $scope.confirm = function () {
                    if ($scope.isInvalidHtml($scope.inScope.value)) {
                        if ($attrs.onErr) {
                            $scope.onErr({
                                error: true,
                                message: 'Error. Img src may only be a relative url starting with /data'
                            });
                        } else {
                            alert('Error. Img src may only be a relative url starting with /data');
                        }
                    } else {
                        $scope.model = $scope.inScope.value;
                        $scope.editMode = false;
                        $scope.onOk();
                    }
                };
                $scope.cancel = function () {
                    $scope.editMode = false;
                };
            },
            templateUrl: '/system/public/js/systemTemplate/inlineAreaEdit.html'
        };
    })
    .directive('sortableArray', function () {
        return {
            restrict: 'AE',
            scope: {
                array: "=sortableArray"
                , index: '=index'
                , cb: '&'
            },
            templateUrl: '/system/public/js/systemTemplate/sortableArray.html',
            controller: function ($scope) {
                $scope.moveUp = function () {
                    $scope.array.splice($scope.index - 1, 0, $scope.array.splice($scope.index, 1)[0]);
                    $scope.cb();
                };
                $scope.moveDown = function () {
                    $scope.array.splice($scope.index + 1, 0, $scope.array.splice($scope.index, 1)[0]);
                    $scope.cb();
                };
                $scope.moveTop = function () {
                    $scope.array.splice(0, 0, $scope.array.splice($scope.index, 1)[0]);
                    $scope.cb();
                };
                $scope.moveBottom = function () {
                    $scope.array.push($scope.array.shift());
                    $scope.cb();
                };
            }
        };
    });

angular.module('systemModule').filter('placeHoldEmpty', function () {
    return function (input) {
        if (!(input === undefined || input === null || input === "")) {
            return input;
        } else {
            return "N/A";
        }
    };
});

angular.module('systemModule').filter('truncateTo', function () {
    return function (input, l) {
        if (input && input.length > l) {
            return input.substr(0, l) + '...';
        } else return input;
    };
});


angular.module('systemModule').filter('truncateLongUserName', function () {
    return function (input) {
        if (!(input === undefined || input === null || input === "")) {
            if (input.length > 17) {
                return input.substr(0, 17) + '...';
            }
            else return input;
        } else {
            return "N/A";
        }
    };
});

angular.module('systemModule').filter('bytes', function () {
    return function (bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    };
});

angular.module('systemModule').factory('isAllowedModel', function (userResource) {
    var isAllowedModel = {};

    isAllowedModel.isAllowed = function ($scope, CuratedItem) {
        if (!CuratedItem) return false;
        if (CuratedItem.archived) {
            return false;
        }
        if (userResource.user.siteAdmin) {
            return true;
        } else {
            if (CuratedItem.registrationState.registrationStatus === "Standard" ||
                CuratedItem.registrationState.registrationStatus === "Preferred Standard") {
                return false;
            }
            if (userResource.userOrgs) {
                return exports.isCuratorOf(userResource.user, CuratedItem.stewardOrg.name);
            } else {
                return false;
            }
        }
    };

    isAllowedModel.setCanCurate = function ($scope) {
        isAllowedModel.runWhenInitialized($scope, function () {
            $scope.canCurate = isAllowedModel.isAllowed($scope, $scope.elt);
        });
    };

    isAllowedModel.runWhenInitialized = function ($scope, toRun) {
        userResource.getPromise().then(toRun);
    };

    isAllowedModel.setDisplayStatusWarning = function ($scope) {
        isAllowedModel.runWhenInitialized($scope, function () {
            $scope.displayStatusWarning = isAllowedModel.displayStatusWarning($scope, $scope.elt);
        });
    };

    isAllowedModel.displayStatusWarning = function ($scope, CuratedItem) {
        if (!CuratedItem) return false;
        if (CuratedItem.archived || userResource.user.siteAdmin) {
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


angular.module("template/accordion/accordion-group.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/accordion/accordion-group.html",
        "<div class=\"panel\" ng-class=\"panelClass || 'panel-default'\">\n" +
        "  <div class=\"panel-heading\" ng-keypress=\"toggleOpen($event)\">\n" +
        "    <h4 class=\"panel-title\">\n" +
        "      <div href tabindex=\"0\" class=\"accordion-toggle\" ng-click=\"toggleOpen()\" uib-accordion-transclude=\"heading\"><span ng-class=\"{'text-muted': isDisabled}\">{{heading}}</span></div>\n" +
        "    </h4>\n" +
        "  </div>\n" +
        "  <div class=\"panel-collapse collapse\" uib-collapse=\"!isOpen\">\n" +
        "	  <div class=\"panel-body\" ng-transclude></div>\n" +
        "  </div>\n" +
        "</div>\n" +
        "");
}]);


angular.module('systemModule').directive('diff', function () {
    return {
        restrict: 'AE'
        , scope: {
            values: '='
        }
        , templateUrl: '/propertyDiff.html'
        , controller: function ($scope) {
            $scope.renderValue = function (value) {
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

angular.module('systemModule').config(['$compileProvider', function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:text\//);
}]);

angular.module('systemModule').config(function ($provide) {
    $provide.decorator('uiSortableDirective', function ($delegate) {
        var directive = $delegate[0];
        var link = directive.link;
        directive.compile = function () {
            return function (scope, element, attrs, ngModel) {
                if (scope.dragEnabled) {
                    link(scope, element, attrs, ngModel);
                }
            };
        };
        return $delegate;
    });
});

angular.module('systemModule').config(function ($provide) {
    var previousException;
    var http;
    $provide.decorator("$exceptionHandler", ['$delegate', '$injector',
        function ($delegate, $injector) {
        return function (exception, cause) {
            $delegate(exception, cause);
            if (previousException && exception.toString() === previousException.toString()) return;
            previousException = exception;
            if (!http) {
                http = $injector.get('$http');
            }
            try {
                if (exception.message.indexOf("[$compile:tpload]") > -1) return;
                http.post('/logClientException', {
                    stack: exception.stack,
                    message: exception.message,
                    name: exception.name,
                    url: window.location.pathname
                });
            } catch (e) {

            }
        };
    }]);
});

angular.module('systemModule').config(function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('nlmcde');
});

angular.module('systemModule').run(function ($rootScope) {
    var timeout;
    $rootScope.$on("$routeChangeSuccess", function (event, next, current) {
        if (!submitWebtrends) return;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            submitWebtrends();
        }, 4000);
    });
});
