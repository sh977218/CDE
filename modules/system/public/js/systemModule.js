import * as authShared from "../../../system/shared/authorizationShared";

angular.module("cdeAppModule", ['systemModule', 'cdeModule', 'formModule']);

angular.module('systemModule', ['ElasticSearchResource', 'resourcesSystem',
    'classification', 'systemTemplates', 'ui.bootstrap', 'ngSanitize', 'ngRoute', 'LocalStorageModule', 'ui.sortable',
    'ui.select', 'angular-send-feedback', 'checklist-model'])
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
            template: '<cde-org-account-management></cde-org-account-management>'
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

angular.module('systemModule').factory('isAllowedModel', ["userResource", function (userResource) {
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
        userResource.then(function () {
            $scope.canCurate = isAllowedModel.isAllowed($scope.elt);
        });
    };

    isAllowedModel.setDisplayStatusWarning = function ($scope) {
        userResource.then(function () {
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
import { OrgHelperService } from "../../../core/public/orgHelper.service";

angular.module('systemModule').factory('OrgHelpers', downgradeInjectable(OrgHelperService));

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

import { SiteAuditComponent } from "../components/siteAdmin/siteAudit/siteAudit.component";
angular.module('systemModule').directive('cdeSiteAudit', downgradeComponent({
    component: SiteAuditComponent,
    inputs: [],
    outputs: []
}));

import {OrgAuthorityComponent} from "../components/siteAdmin/orgAuthority/orgAuthority.component"
angular.module('systemModule').directive('cdeOrgAuthority', downgradeComponent({
    component: OrgAuthorityComponent,
    inputs: [],
    outputs: []
}));

import {RegistrationValidatorService} from "../components/registrationValidator.service";
angular.module('systemModule').factory('RegStatusValidator', downgradeInjectable(RegistrationValidatorService));

import { SwaggerComponent } from "../components/swagger.component";
angular.module('systemModule').directive('cdeSwagger', downgradeComponent({
    component: SwaggerComponent,
    inputs: [],
    outputs: []
}));

import { AlertService } from "../components/alert/alert.service";
angular.module('systemModule').factory('AlertService', downgradeInjectable(AlertService));

import { AlertComponent } from "../components/alert/alert.component";
angular.module('systemModule').directive('cdeAlert', downgradeComponent(
    {component: AlertComponent, inputs: [], outputs: []}));

import {SiteManagementComponent} from "../components/siteAdmin/siteManagement/siteManagement.component"
angular.module('systemModule').directive('cdeSiteManagement', downgradeComponent(
    {component: SiteManagementComponent, inputs: [], outputs: []}));

import {InboxComponent} from "../components/inbox/inbox.component"
angular.module('systemModule').directive('cdeInbox', downgradeComponent(
    {component: InboxComponent, inputs: [], outputs: []}));

import { MergeCdeService } from "../../../core/public/mergeCde.service";
angular.module('systemModule').factory('MergeCdeService', downgradeInjectable(MergeCdeService));

import {SearchPreferencesComponent} from "../components/searchPreferences/searchPreferences.component"
angular.module('systemModule').directive('cdeSearchPreferences', downgradeComponent(
    {component: SearchPreferencesComponent, inputs: [], outputs: []}));

import {OrgAccountManagementComponent} from "../components/siteAdmin/orgAccountManagement/orgAccountManagement.component";
angular.module('systemModule').directive('cdeOrgAccountManagement', downgradeComponent(
    {component: OrgAccountManagementComponent, inputs: [], outputs: []}));

import {LoginComponent} from "../components/login/login.component"
angular.module('systemModule').directive('cdeLogin', downgradeComponent(
    {component: LoginComponent, inputs: [], outputs: []}));

import {PublicBoardsComponent} from "../../../board/public/components/publicBoards/publicBoards.component";
angular.module('systemModule').directive('cdePublicBoards', downgradeComponent(
    {component: PublicBoardsComponent, inputs: [], outputs: []}));

import {LatestCommentsComponent} from "../../../discuss/components/latestComments/latestComments.component";
angular.module('systemModule').directive('cdeLatestComments', downgradeComponent(
    {component: LatestCommentsComponent, inputs: [], outputs: []}));
