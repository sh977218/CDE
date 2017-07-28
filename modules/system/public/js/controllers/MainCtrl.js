import * as authShared from "../../../../system/shared/authorizationShared";

angular.module('systemModule').controller('MainCtrl',
    ['$scope', '$uibModal', 'userResource', '$http', '$location', '$anchorScroll', '$timeout', '$cacheFactory',
        '$interval', '$window', 'screenSize', 'OrgHelpers', 'QuickBoard', 'FormQuickBoard',
        function ($scope, $modal, userResource, $http, $location, $anchorScroll, $timeout, $cacheFactory,
                  $interval, $window, screenSize, OrgHelpers, QuickBoard, FormQuickBoard) {

            $scope.quickBoard = QuickBoard;
            $scope.formQuickBoard = FormQuickBoard;
            $scope.prodDumpEnabled = window.prodDumpEnabled;

            $scope.resultPerPage = 20;

            userResource.getPromise().then(function () {
                $scope.user = userResource.user;
                $scope.myOrgs = userResource.userOrgs;
            });

            $scope.canCreateForms = function () {
                return authShared.hasRole(userResource.user, "FormEditor");
            };

            $scope.reloadUser = function () {
                userResource.getRemoteUser();
                userResource.getPromise().then(function () {
                    $scope.user = userResource.user;
                    $scope.myOrgs = userResource.userOrgs;
                });
            };

            $scope.isOrgAdmin = function () {
                return authShared.isOrgAdmin(userResource.user);
            };

            $scope.isDocumentationEditor = function () {
                return authShared.hasRole(userResource.user, "DocumentationEditor");
            };

            $scope.scrollTo = function (id) {
                var old = $location.hash();
                $location.hash(id);
                $anchorScroll();
                //reset to old to keep any additional routing logic from kicking in
                $location.hash(old);
            };

            $scope.initCache = function () {
                if ($cacheFactory.get("deListCache") === undefined) {
                    $scope.cache = $cacheFactory("deListCache");
                } else {
                    $scope.cache = $cacheFactory.get("deListCache");
                }
            };

            $scope.initCache();

            $scope.searchByClassification = function (orgName, elts, type) {
                $location.url('/' + type + '/search?selectedOrg=' + encodeURIComponent(orgName) +
                "&classification=" + encodeURIComponent(elts.join(";")));
            };

            // Gets screen size and also updates it in the callboack on screen resize
            $scope.isScreenSizeXsSm = screenSize.on('xs, sm', function (isScreenSize) {
                $scope.isScreenSizeXsSm = isScreenSize;
            });

            // Retrieves orgs details from database at an interval
            OrgHelpers.getOrgsDetailedInfoAPI();

        }
    ]);
