import * as authShared from "../../../system/shared/authorizationShared";

angular.module("cdeAppModule", ['systemModule', 'cdeModule', 'formModule']);

angular.module('systemModule', ['ElasticSearchResource', 'resourcesSystem',
    'OrgFactories', 'classification', 'systemTemplates',
    'ui.bootstrap', 'ngSanitize', 'ngRoute', 'textAngular', 'LocalStorageModule', 'ui.sortable',
    'ui.select', 'yaru22.angular-timeago', 'angularFileUpload', 'ngTextTruncate',
    'angular-send-feedback', 'ngAnimate', 'checklist-model', 'infinite-scroll'])
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
        }).when('/api', {
            template: '<cde-swagger></cde-swagger>'
        }).when('/home', {
            template: '<cde-home></cde-home>'
        }).when('/login', {
            template: '<cde-login></cde-login>'
        }).when('/siteAudit', {
            template: '<cde-site-audit></cde-site-audit>'
        }).when('/inbox', {
            template: '<cde-inbox></cde-inbox>'
        }).when('/orgComments', {
            template: '<cde-latest-comments [comments-url]="\'/orgComments/\'"></cde-latest-comments>'
        }).when('/siteaccountmanagement', {
            template: '<cde-site-management></cde-site-management>'
        }).when('/orgaccountmanagement', {
            controller: 'AccountManagementCtrl',
            templateUrl: '/system/public/html/orgAccountManagement.html'
        }).when('/classificationmanagement', {
            controller: 'ClassificationManagementCtrl',
            templateUrl: '/system/public/html/classificationManagement.html'
        }).when('/orgAuthority', {
            template: '<cde-org-authority></cde-org-authority>'
        }).when('/profile', {
            template: '<cde-profile></cde-profile>'
        }).when('/triggerClientException', {
            controller:  ['$scope', function($scope) {trigger.error();}],
            template: 'An exception in your browser has been triggered.'
        }).when('/searchPreferences', {
            template: '<cde-search-preferences></cde-search-preferences>'
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
    .directive('cdeSelectBoard', [function () {
        return {
            restrict: 'AE',
            controller: 'SelectBoardModalCtrl',
            templateUrl: '/system/public/html/selectBoardModal.html',
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
        return orgHelpers.showWorkingGroup(stewardClassifications.stewardOrg.name, userResource.user) || authShared.isSiteAdmin(userResource.user);
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

angular.module('systemModule').controller('SearchCtrl', ['$scope', function ($scope) {
    $scope.searchReloadCount = 0;
    $scope.$on('$routeUpdate',function() {
        $scope.searchReloadCount++;
    });
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
                        }, 5000);
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

import { downgradeComponent, downgradeInjectable } from "@angular/upgrade/static";

import { ClassificationService } from "../../../core/public/classification.service";

angular.module('systemModule').factory('ClassificationUtil', downgradeInjectable(ClassificationService));

import { HomeComponent } from "../components/home/home.component";
angular.module('systemModule').directive('cdeHome', downgradeComponent({
    component: HomeComponent,
    inputs: [],
    outputs: []
}));

import { NavigationComponent } from "../components/navigation.component";

angular.module('systemModule').directive('cdeNavigation', downgradeComponent({
    component: NavigationComponent,
    inputs: [], outputs: ['goToLogin', 'logout']
}));

import { ProfileComponent } from "../components/profile.component";

angular.module('systemModule').directive('cdeProfile', downgradeComponent({
    component: ProfileComponent,
    inputs: ['commentsUrl'],
    outputs: []
}));

import { UserCommentsComponent } from "../components/userComments.component";

angular.module('systemModule').directive('user-comments', downgradeComponent({
    component: UserCommentsComponent,
    inputs: ['user'],
    outputs: []
}));


import { SiteAuditComponent } from "../components/siteAdmin/siteAudit/siteAudit.component";
angular.module('systemModule').directive('cdeSiteAudit', downgradeComponent({
    component: SiteAuditComponent,
    inputs: [],
    outputs: []
}));

import { OrgAdminComponent } from "../components/siteAdmin/orgAdmin/orgAdmin.component";
angular.module('systemModule').directive('cdeOrgAdmin', downgradeComponent({
    component: OrgAdminComponent,
    inputs: [],
    outputs: []
}));

import { UsersMgtComponent } from "../components/siteAdmin/usersMgt/usersMgt.component";

angular.module('systemModule').directive('cdeUsersMgt', downgradeComponent({
    component: UsersMgtComponent,
    inputs: [],
    outputs: []
}));

import {OrgAuthorityComponent} from "../components/siteAdmin/orgAuthority/orgAuthority.component"
angular.module('systemModule').directive('cdeOrgAuthority', downgradeComponent({
    component: OrgAuthorityComponent,
    inputs: [],
    outputs: []
}));

import {EditSiteAdminsComponent} from "../components/siteAdmin/editSiteAdmins/editSiteAdmins.component"
angular.module('systemModule').directive('cdeEditSiteAdmins', downgradeComponent({
    component: EditSiteAdminsComponent,
    inputs: [],
    outputs: []
}));

import {RegistrationValidatorService} from "../components/registrationValidator.service";
angular.module('systemModule').factory('RegStatusValidator', downgradeInjectable(RegistrationValidatorService));

import { TableListComponent } from "../../../search/listView/tableList.component";
angular.module('systemModule').directive('cdeTableList', downgradeComponent({
    component: TableListComponent,
    inputs: ['elts', 'module'],
    outputs: []
}));

import { SwaggerComponent } from "../components/swagger.component";
angular.module('systemModule').directive('cdeSwagger', downgradeComponent({
    component: SwaggerComponent,
    inputs: [],
    outputs: []
}));

import { DiscussAreaComponent } from "../../../discuss/components/discussArea/discussArea.component";
angular.module('systemModule').directive('cdeDiscussArea', downgradeComponent(
    {component: DiscussAreaComponent, inputs: ['elt', 'selectedElt', 'eltId', 'eltName'], outputs: []}));

import { AlertService } from "../components/alert/alert.service";
angular.module('systemModule').factory('AlertService', downgradeInjectable(AlertService));

import { AlertComponent } from "../components/alert/alert.component";
angular.module('systemModule').directive('cdeAlert', downgradeComponent(
    {component: AlertComponent, inputs: [], outputs: []}));

import {ServerStatusComponent} from "../components/siteAdmin/serverStatus/serverStatus.component"
angular.module('systemModule').directive('cdeServerStatus', downgradeComponent(
    {component: ServerStatusComponent, inputs: [], outputs: []}));

import {SiteManagementComponent} from "../components/siteAdmin/siteManagement/siteManagement.component"
angular.module('systemModule').directive('cdeSiteManagement', downgradeComponent(
    {component: SiteManagementComponent, inputs: [], outputs: []}));

import {LatestCommentsComponent} from "../../../discuss/components/latestComments/latestComments.component"
angular.module('systemModule').directive('cdeLatestComments', downgradeComponent(
    {component: LatestCommentsComponent, inputs: ['commentsUrl'], outputs: []}));

import {InboxComponent} from "../components/inbox/inbox.component"
angular.module('systemModule').directive('cdeInbox', downgradeComponent(
    {component: InboxComponent, inputs: [], outputs: []}));

import { MergeCdeService } from "../../../core/public/mergeCde.service";
angular.module('systemModule').factory('MergeCdeService', downgradeInjectable(MergeCdeService));

import {SearchPreferencesComponent} from "../components/searchPreferences/searchPreferences.component"
angular.module('systemModule').directive('cdeSearchPreferences', downgradeComponent(
    {component: SearchPreferencesComponent, inputs: [], outputs: []}));

import {EmbedComponent} from "../components/embed/embed.component"
angular.module('systemModule').directive('cdeEmbed', downgradeComponent({component: EmbedComponent, inputs: [], outputs: []}));

import {LoginComponent} from "../components/login/login.component"
angular.module('systemModule').directive('cdeLogin', downgradeComponent(
    {component: LoginComponent, inputs: [], outputs: []}));

import {PublicBoardsComponent} from "../../../board/public/components/publicBoards/publicBoards.component";
angular.module('systemModule').directive('cdePublicBoards', downgradeComponent(
    {component: PublicBoardsComponent, inputs: [], outputs: []}));
