import * as authShared from "../../../system/shared/authorizationShared";

angular.module("cdeAppModule", ['systemModule', 'cdeModule', 'formModule']);

angular.module('systemModule', ['ElasticSearchResource', 'resourcesSystem',
    'OrgFactories', 'classification', 'systemTemplates',
    'ui.bootstrap', 'ngSanitize', 'ngRoute', 'textAngular', 'LocalStorageModule', 'matchMedia', 'ui.sortable',
    'ui.select', 'camelCaseToHuman', 'yaru22.angular-timeago', 'angularFileUpload', 'ngTextTruncate',
    'angular-send-feedback', 'ngAnimate', 'ngDisplayObject', 'ngCompareSideBySide', 'comparePrimitive',
    'comparePrimitiveArray', 'compareObject', 'compareObjectArray', 'checklist-model', 'infinite-scroll', 'monospaced.elastic'])
    .config(['$logProvider', function ($logProvider) {
        $logProvider.debugEnabled(window.debugEnabled);
    }])
    .config(['$rootScopeProvider', function ($rootScopeProvider) {
        $rootScopeProvider.digestTtl(50);
    }])
    .config(["$routeProvider", "$locationProvider", function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode({enabled: true, requireBase: false});
        $routeProvider.when('/', {
            redirectTo: function () {
                if (!window.loggedIn) return "/home";
                return "/cde/search";
            }
        }).when('/home', {
            template: '<cde-home></cde-home>'
        }).when('/login', {
            controller: 'AuthCtrl',
            templateUrl: '/system/public/html/login.html'
        }).when('/siteAudit', {
            templateUrl: '/system/public/html/siteAudit.html'
        }).when('/inbox', {
            controller: 'InboxCtrl',
            templateUrl: '/system/public/html/inbox.html'
        }).when('/orgComments', {
            controller: ['$scope', function ($scope) {
                $scope.commentsUrl = "/orgComments/";
            }],
            templateUrl: '/system/public/html/latestComments.html'
        }).when('/siteaccountmanagement', {
            controller: 'SiteManagementCtrl',
            templateUrl: '/system/public/html/siteAccountManagement.html'
        }).when('/orgaccountmanagement', {
            controller: 'AccountManagementCtrl',
            templateUrl: '/system/public/html/orgAccountManagement.html'
        }).when('/classificationmanagement', {
            controller: 'ClassificationManagementCtrl',
            templateUrl: '/system/public/html/classificationManagement.html'
        }).when('/orgAuthority', {
            controller: 'AccountManagementCtrl',
            templateUrl: '/system/public/html/orgAuthority.html'
        }).when('/profile', {
            template: '<cde-profile></cde-profile>'
        }).when('/triggerClientException', {
            controller: 'TriggerClientExceptionCtrl',
            templateUrl: '/system/public/html/triggerClientException.html'
        }).when('/searchSettings', {
            controller: 'SearchSettingsCtrl',
            templateUrl: '/system/public/html/searchSettings.html'
        });
    }])
    .directive('inlineEdit', ["$timeout", function ($timeout) {
        return {
            restrict: 'AE',
            scope: {
                model: '=',
                inputType: '=?',
                isAllowed: '=',
                onOk: '&',
                typeaheadSource: '=',
                linkSource: '@'
            },
            template: require('../html/systemTemplate/inlineEdit.html'),
            controller: ["$scope", function ($scope) {
                $scope.inputType = $scope.inputType || 'text';
                $scope.value = $scope.model;
                $scope.discard = function () {
                    $scope.editMode = false;
                };
                $scope.save = function () {
                    $scope.model = angular.copy(this.value);
                    $scope.editMode = false;
                    $timeout($scope.onOk, 0);
                };
                $scope.edit = function () {
                    $scope.value = $scope.model;
                    $scope.editMode = true;
                };
            }]
        };
    }])
    .directive('inlineSelectEdit', ["$timeout", function ($timeout) {
        return {
            restrict: 'AE',
            scope: {
                model: '=',
                isAllowed: '=',
                onOk: '&',
                allOptions: '='
            },
            template: require('../html/systemTemplate/inlineSelectEdit.html'),
            controller: ["$scope", function ($scope) {
                $scope.discard = function () {
                    $scope.editMode = false;
                };
                $scope.save = function () {
                    $scope.editMode = false;
                    $timeout($scope.onOk, 0);
                };
                $scope.edit = function () {
                    $scope.editMode = true;
                };
            }]
        };
    }])
    .directive('inlineAreaEdit', ["$timeout", function ($timeout) {
        return {
            restrict: 'AE',
            scope: {
                model: '=',
                isAllowed: '=',
                onOk: '&',
                onErr: '&',
                defFormat: '=',
            },
            templateUrl: '/system/public/html/systemTemplate/inlineAreaEdit.html',
            controller: ["$scope", "$element", function ($scope) {
                $scope.setHtml = function (html) {
                    $scope.defFormat = html ? 'html' : '';
                };
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
                        alert('Error. Img src may only be a relative url starting with /data');
                    } else {
                        $scope.model = $scope.inScope.value;
                        $scope.editMode = false;
                        $timeout($scope.onOk, 0);
                    }
                };
                $scope.cancel = function () {
                    $scope.editMode = false;
                };
            }]
        };
    }])
    .directive('sortableArray', [function () {
        return {
            restrict: 'AE',
            scope: {
                theArray: "=",
                index: '=index',
                cb: '&'
            },
            template: require('../html/systemTemplate/sortableArray.html'),
            controller: ["$scope", function ($scope) {
                $scope.moveUp = function () {
                    $scope.theArray.splice($scope.index - 1, 0, $scope.theArray.splice($scope.index, 1)[0]);
                    $scope.cb();
                };
                $scope.moveDown = function () {
                    $scope.theArray.splice($scope.index + 1, 0, $scope.theArray.splice($scope.index, 1)[0]);
                    $scope.cb();
                };
                $scope.moveTop = function () {
                    $scope.theArray.splice(0, 0, $scope.theArray.splice($scope.index, 1)[0]);
                    $scope.cb();
                };
                $scope.moveBottom = function () {
                    $scope.theArray.push($scope.array.shift());
                    $scope.cb();
                };
            }]
        };
    }]);

angular.module('systemModule').filter('placeHoldEmpty', [function () {
    return function (input) {
        if (!(input === undefined || input === null || input === "")) {
            return input;
        } else {
            return "N/A";
        }
    };
}]);

angular.module('systemModule').filter('truncateTo', [function () {
    return function (input, l) {
        if (input && input.length > l) {
            return input.substr(0, l) + '...';
        } else return input;
    };
}]);

angular.module('systemModule').filter('bytes', [function () {
    return function (bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    };
}]);

//ported
angular.module('systemModule').filter('tagsToArray', [function () {
    return function (input) {
        return input.map(function (m) {
            return m.tag;
        }).join(', ');
    };
}]);

angular.module('systemModule').factory('PinModal', ["userResource", "$uibModal", "$http", 'AlertService',
    function (userResource, $modal, $http, Alert) {
    return {
        new: function (type) {
            return {
                openPinModal: function (elt) {
                    if (userResource.user.username) {
                        $modal.open({
                            animation: false,
                            templateUrl: '/system/public/html/selectBoardModal.html',
                            controller: 'SelectBoardModalCtrl',
                            resolve: {
                                type: function () {
                                    return type;
                                }
                            }
                        }).result.then(function (selectedBoard) {
                            $http.put("/pin/" + type + "/" + elt.tinyId + "/" + selectedBoard._id).then(function (response) {
                                if (response.status === 200) {
                                    Alert.addAlert("success", response.data);
                                } else
                                    Alert.addAlert("warning", response.data);
                            }, function (response) {
                                Alert.addAlert("danger", response.data);
                            });
                        }, function () {
                        });
                    } else {
                        $modal.open({
                            animation: false,
                            templateUrl: '/system/public/html/ifYouLogInModal.html'
                        }).result.then(function () {
                        }, function () {
                        });
                    }
                }
            };
        }
    };
}]);


angular.module('systemModule').factory('isAllowedModel', ["userResource", "OrgHelpers", function (userResource, orgHelpers) {
    var isAllowedModel = {};

    isAllowedModel.isAllowed = function (CuratedItem) {
        if (!CuratedItem) return false;
        if (CuratedItem.archived) {
            return false;
        }
        if (userResource.user && userResource.user.siteAdmin) {
            return true;
        } else {
            if (CuratedItem.registrationState.registrationStatus === "Standard" ||
                CuratedItem.registrationState.registrationStatus === "Preferred Standard") {
                return false;
            }
            if (userResource.userOrgs) {
                return authShared.isCuratorOf(userResource.user, CuratedItem.stewardOrg.name);
            } else {
                return false;
            }
        }
    };

    isAllowedModel.setCanCurate = function ($scope) {
        isAllowedModel.runWhenInitialized($scope, function () {
            $scope.canCurate = isAllowedModel.isAllowed($scope.elt);
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
                return authShared.isCuratorOf(userResource.user, CuratedItem.stewardOrg.name) && (CuratedItem.registrationState.registrationStatus === "Standard" || CuratedItem.registrationState.registrationStatus === "fPreferred Standard");
            } else {
                return false;
            }
        }
    };

    isAllowedModel.isOrgCurator = function () {
        return authShared.isOrgCurator(userResource.user);
    };

    isAllowedModel.isCuratorFor = function (orgName) {
        return authShared.isCuratorOf(userResource.user, orgName);
    };

    isAllowedModel.hasRole = function (role) {
        return authShared.hasRole(userResource.user, role);
    };

    isAllowedModel.isSiteAdmin = function (role) {
        return authShared.isSiteAdmin(userResource.user);
    };

    isAllowedModel.showWorkingGroups = function (stewardClassifications) {
        return orgHelpers.showWorkingGroup(stewardClassifications.stewardOrg.name, userResource.user)
            || authShared.isSiteAdmin(userResource.user);
    };

    isAllowedModel.doesUserOwnElt = function (elt) {
        if (elt.elementType === 'board') {
            return userResource.user.siteAdmin || (userResource.user.username === elt.owner.username);
        } else
            return userResource.user &&
                (userResource.user.siteAdmin || (userResource.user._id && (userResource.user.orgAdmin.indexOf(elt.stewardOrg.name) > -1)));
    };

    isAllowedModel.loggedIn = function () {
        return (userResource.user && userResource.user._id) ? true : false;
    };

    return isAllowedModel;
}]);

angular.module('systemModule').config(['$compileProvider', function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:text\//);
}]);

angular.module('systemModule').config(["$provide", function ($provide) {
    var previousException;
    var lock = false;
    $provide.decorator("$exceptionHandler", ['$delegate', '$injector',
        function ($delegate, $injector) {
            return function (exception, cause) {
                $delegate(exception, cause);
                if (previousException && exception.toString() === previousException.toString()) return;
                previousException = exception;
                try {
                    if (exception.message.indexOf("[$compile:tpload]") > -1) return;
                    if (!lock) {
                        lock = true;
                        $injector.get('$http').post('/logClientException', {
                            stack: exception.stack,
                            message: exception.message,
                            name: exception.name,
                            url: window.location.href
                        });
                        $injector.get('$timeout')(function () {
                            lock = false;
                        }, 5000)
                    }
                } catch (e) {

                }
            };
        }]);
}]);

angular.module('systemModule').config(["localStorageServiceProvider", function (localStorageServiceProvider) {
    localStorageServiceProvider.setPrefix('nlmcde');
}]);

angular.module('systemModule').run(["$rootScope", "$location", function ($rootScope, $location) {
    var dataLayer = window.dataLayer = window.dataLayer || [];

    $rootScope.$on("$locationChangeSuccess", function () {
        dataLayer.push({
            event: 'ngRouteChange',
            attributes: {
                route: $location.path()
            }
        });
    });
}]);

import {downgradeComponent, downgradeInjectable} from "@angular/upgrade/static";

import {ClassificationService} from "../../../core/public/classification.service";
angular.module('systemModule').factory('ClassificationUtil', downgradeInjectable(ClassificationService));

import {HomeComponent} from "../components/home/home.component";
angular.module('systemModule').directive('cdeHome', downgradeComponent({component: HomeComponent, inputs: [], outputs: []}));

import {NavigationComponent} from "../components/navigation.component";
angular.module('systemModule').directive('cdeNavigation', downgradeComponent({component: NavigationComponent,
    inputs: ['quickBoardCount'], outputs: ['takeATour', 'goToLogin', 'logout']}));

import {ProfileComponent} from "../components/profile.component";
angular.module('systemModule').directive('cdeProfile', downgradeComponent({component: ProfileComponent, inputs: [], outputs: []}));

import {UserCommentsComponent} from "../components/userComments.component";
angular.module('systemModule').directive('user-comments', downgradeComponent({component: UserCommentsComponent, inputs: ['user'], outputs: []}));

import {LogAuditComponent} from "../components/siteAdmin/logAudit/logAudit.component";
angular.module('systemModule').directive('cdeLogAudit', downgradeComponent({component: LogAuditComponent, inputs: [], outputs: []}));

import {AppLogComponent} from "../components/siteAdmin/appLogs/appLog.component";
angular.module('systemModule').directive('cdeAppLog', downgradeComponent({component: AppLogComponent, inputs: [], outputs: []}));

import {ListManagementComponent} from "../components/siteAdmin/listManagement/listManagement.component";
angular.module('systemModule').directive('cdeListManagement', downgradeComponent({component: ListManagementComponent, inputs: [], outputs: []}));

import {OrgAdminComponent} from "../components/siteAdmin/orgAdmin/orgAdmin.component";
angular.module('systemModule').directive('cdeOrgAdmin', downgradeComponent({component: OrgAdminComponent, inputs: [], outputs: []}));

import {DailyUsageComponent} from "../components/siteAdmin/dailyUsage/dailyUsage.component";
angular.module('systemModule').directive('cdeDailyUsage', downgradeComponent({component: DailyUsageComponent, inputs: [], outputs: []}));

import {UsersMgtComponent} from "../components/siteAdmin/usersMgt/usersMgt.component";
angular.module('systemModule').directive('cdeUsersMgt', downgradeComponent({component: UsersMgtComponent, inputs: [], outputs: []}));

import {IdentifiersComponent} from "../../../adminItem/public/components/identifiers.component";
angular.module('systemModule').directive('cdeAdminItemIds', downgradeComponent({component: IdentifiersComponent, inputs: ['elt'], outputs: []}));

import {AttachmentsComponent} from "../../../adminItem/public/components/attachments/attachments.component";
angular.module('systemModule').directive('cdeAdminItemAttachments', downgradeComponent({component: AttachmentsComponent, inputs: ['elt'], outputs: []}));

import {PropertiesComponent} from "../../../adminItem/public/components/properties.component";
angular.module('systemModule').directive('cdeAdminItemProperties', downgradeComponent({component: PropertiesComponent, inputs: ['elt'], outputs: []}));

import {HistoryComponent} from "../../../adminItem/public/components/history.component";
angular.module('systemModule').directive('cdeAdminItemHistory', downgradeComponent({component: HistoryComponent, inputs: ['elt'], outputs: []}));

import {NamingComponent} from "../../../adminItem/public/components/naming.component";
angular.module('systemModule').directive('cdeAdminItemNaming', downgradeComponent({component: NamingComponent, inputs: ['elt'], outputs: []}));

import {ReferenceDocumentComponent} from "../../../adminItem/public/components/referenceDocument.component";
angular.module('systemModule').directive('cdeAdminItemReferenceDocument', downgradeComponent({component: ReferenceDocumentComponent, inputs: ['elt'], outputs: []}));

import {RegistrationComponent} from "../../../adminItem/public/components/registration/registration.component";
angular.module('systemModule').directive('cdeRegistration', downgradeComponent({component: RegistrationComponent, inputs: ['elt'], outputs: []}));

import {TableListComponent} from "../../../search/searchResults/tableList.component";
angular.module('systemModule').directive('cdeTableList', downgradeComponent({component: TableListComponent, inputs: ['elts', 'module'], outputs: []}))

import {SourcesComponent} from "../../../adminItem/public/components/sources/sources.component";
angular.module('systemModule').directive('cdeAdminItemSources', downgradeComponent({component: SourcesComponent, inputs: ['elt'], outputs: []}));

import {LinkedBoardsComponent} from "../../../board/public/components/linkedBoards/linkedBoards.component";
angular.module('systemModule').directive('cdeLinkedBoards', downgradeComponent({component: LinkedBoardsComponent, inputs: ['elt'], outputs: []}));

import {ClassificationComponent} from "../../../adminItem/public/components/classification/classification.component";
angular.module('systemModule').directive('cdeAdminItemClassification', downgradeComponent({component: ClassificationComponent, inputs: ['elt'], outputs: []}));

import {DiscussAreaComponent} from "../../../discuss/components/discussArea/discussArea.component";
angular.module('systemModule').directive('cdeDiscussArea', downgradeComponent(
    {component: DiscussAreaComponent, inputs: ['elt', 'selectedElt', 'eltId', 'eltName'], outputs: []}));

import {AlertService} from "../components/alert/alert.service";
angular.module('systemModule').factory('AlertService', downgradeInjectable(AlertService));

import {AlertComponent} from "../components/alert/alert.component";
angular.module('systemModule').directive('cdeAlert', downgradeComponent(
    {component: AlertComponent, inputs: [], outputs: []}));
