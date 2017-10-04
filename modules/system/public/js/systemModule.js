angular.module("cdeAppModule", ['systemModule', 'cdeModule', 'formModule']);

angular.module('systemModule', ['ngSanitize', 'ngRoute', 'LocalStorageModule', 'angular-send-feedback'])
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
            template: '<cde-org-classification-management></cde-org-classification-management>'
        }).when('/orgAuthority', {
            template: '<cde-org-authority></cde-org-authority>'
        }).when('/profile', {
            template: '<cde-profile></cde-profile>'
        }).when('/triggerClientException', {
            controller:  ['$scope', function() {trigger.error();}],
            template: 'An exception in your browser has been triggered.'
        }).when('/searchPreferences', {
            template: '<cde-search-preferences></cde-search-preferences>'
        });
    }])
;

angular.module('systemModule').controller('SearchCtrl', ['$scope', function ($scope) {
    $scope.searchReloadCount = 0;
    $scope.$on('$routeUpdate',function() {
        $scope.searchReloadCount++;
    });
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

import { downgradeComponent, downgradeInjectable } from "@angular/upgrade/static";
import { OrgHelperService } from "../../../core/public/orgHelper.service";

angular.module('systemModule').factory('OrgHelpers', downgradeInjectable(OrgHelperService));
angular.module('systemModule').factory('userResource', downgradeInjectable(UserService));

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

import {OrgAuthorityComponent} from "../components/siteAdmin/orgAuthority/orgAuthority.component";
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

import {SiteManagementComponent} from "../components/siteAdmin/siteManagement/siteManagement.component";
angular.module('systemModule').directive('cdeSiteManagement', downgradeComponent(
    {component: SiteManagementComponent, inputs: [], outputs: []}));

import {InboxComponent} from "../components/inbox/inbox.component";
angular.module('systemModule').directive('cdeInbox', downgradeComponent(
    {component: InboxComponent, inputs: [], outputs: []}));

import { MergeCdeService } from "../../../core/public/mergeCde.service";
angular.module('systemModule').factory('MergeCdeService', downgradeInjectable(MergeCdeService));

import {SearchPreferencesComponent} from "../components/searchPreferences/searchPreferences.component";
angular.module('systemModule').directive('cdeSearchPreferences', downgradeComponent(
    {component: SearchPreferencesComponent, inputs: [], outputs: []}));

import {OrgAccountManagementComponent} from "../components/siteAdmin/orgAccountManagement/orgAccountManagement.component";
angular.module('systemModule').directive('cdeOrgAccountManagement', downgradeComponent(
    {component: OrgAccountManagementComponent, inputs: [], outputs: []}));

import {OrgClassificationManagementComponent} from "../components/siteAdmin/orgClassificationManagement/orgClassificationManagement.component";
angular.module('systemModule').directive('cdeOrgClassificationManagement', downgradeComponent(
    {component: OrgClassificationManagementComponent, inputs: [], outputs: []}));

import {LoginComponent} from "../components/login/login.component";
angular.module('systemModule').directive('cdeLogin', downgradeComponent(
    {component: LoginComponent, inputs: [], outputs: []}));

import {PublicBoardsComponent} from "../../../board/public/components/publicBoards/publicBoards.component";
angular.module('systemModule').directive('cdePublicBoards', downgradeComponent(
    {component: PublicBoardsComponent, inputs: [], outputs: []}));

import {LatestCommentsComponent} from "../../../discuss/components/latestComments/latestComments.component";
import { UserService } from "../../../core/public/user.service";
angular.module('systemModule').directive('cdeLatestComments', downgradeComponent(
    {component: LatestCommentsComponent, inputs: [], outputs: []}));
