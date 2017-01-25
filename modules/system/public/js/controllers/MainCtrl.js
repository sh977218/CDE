var authShared = require('../../../../system/shared/authorizationShared');

angular.module('systemModule').controller('MainCtrl',
    ['$scope', '$uibModal', 'userResource', '$http', '$location', '$anchorScroll', '$timeout', '$cacheFactory',
        '$interval', '$window', 'screenSize', 'OrgHelpers', 'QuickBoard', 'FormQuickBoard', 'Alert',
        function ($scope, $modal, userResource, $http, $location, $anchorScroll, $timeout, $cacheFactory,
                  $interval, $window, screenSize, OrgHelpers, QuickBoard, FormQuickBoard, Alert) {

            $scope.quickBoard = QuickBoard;
            $scope.formQuickBoard = FormQuickBoard;
            $scope.prodDumpEnabled = window.prodDumpEnabled;

            // Global variables
            var GLOBALS = {
                getOrgsInterval: 1000 * 60 * 10 // 10 min
            };

            $scope.resultPerPage = 20;

            userResource.getPromise().then(function () {
                $scope.user = userResource.user;
                $scope.myOrgs = userResource.userOrgs;
                $scope.checkMail();
            });

            $scope.canCreateForms = function () {
                return authShared.hasRole(userResource.user, "FormEditor");
            };

            $scope.checkSystemAlert = function () {
                $http.get('/systemAlert').then(function onSuccess(response) {
                    if (response.data.length > 0) {
                        var id = (new Date()).getTime();
                        if ($scope.broadcast !== response.data) {
                            $scope.broadcast = response.data;
                            $scope.alerts.push({type: "warning", msg: $scope.broadcast, id: id});
                        }
                    }
                    $timeout(function () {
                        $scope.checkSystemAlert();
                    }, 120000);
                }).catch(function onError() {});
            };
            $scope.checkSystemAlert();

            //TODO: Don't use the following methods. Use $scope.Alert instead.
            $scope.addAlert = Alert.addAlert;
            $scope.closeAlert = Alert.closeAlert;
            $scope.alerts = Alert.mapAlerts();

            $scope.Alert = Alert;

            $scope.isOrgCurator = function () {
                return authShared.isOrgCurator(userResource.user);
            };

            $scope.isOrgAdmin = function () {
                return authShared.isOrgAdmin(userResource.user);
            };


            $scope.isOrgAuthority = function() {
                return authShared.hasRole(userResource.user, "OrgAuthority");
            };

            $scope.isSiteAdmin = function () {
                return userResource.user !== undefined && userResource.user.siteAdmin;
            };

            $scope.isDocumentationEditor = function () {
                return authShared.hasRole(userResource.user, "DocumentationEditor");
            };

            $scope.isPageActive = function (viewLocation) {
                return viewLocation === $location.path();
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

            $scope.checkMail = function () {
                if (userResource.user) {
                    $http.get('/mailStatus').then(function onSuccess(response) {
                        if (response.data.count > 0) $scope.userHasMail = true;
                    });
                }
            };

            $interval(function () {
                OrgHelpers.getOrgsDetailedInfoAPI();
                $scope.checkMail();
            }, GLOBALS.getOrgsInterval);

        }
    ]);
