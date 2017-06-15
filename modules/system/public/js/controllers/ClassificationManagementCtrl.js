angular.module('systemModule').controller('ClassificationManagementCtrl',
    ['$scope', '$http', '$uibModal', 'OrgClassification', '$timeout', 'Elastic', 'userResource', 'SearchSettings', '$log', 'AlertService',
        function($scope, $http, $modal, OrgClassification, $timeout, Elastic, userResource, SearchSettings, $log, Alert)
{

    $scope.module = "cde";
    $scope.classifSubEltPage = '/system/public/html/classif-elt-mgt.html';

    userResource.getPromise().then(function(){
        if (userResource.userOrgs.length > 0)  {
            $scope.orgToManage = userResource.userOrgs[0];
            $scope.userOrgs = userResource.userOrgs;
        }
    });

    $scope.org = {};

    $scope.$watch('orgToManage', function() {
        if ($scope.orgToManage !== undefined) {
            $http.get("/org/" + encodeURIComponent($scope.orgToManage)).then(function(response) {
                $scope.org = response.data;
            }, function (err) {
                $log.error("Error retrieving org classifs. ");
                $log.error(JSON.stringify(err));
            });
        }
    });

    $scope.classificationToFilter = function() {
        return $scope.org.classifications;
    };

    $scope.removeClassification = function(orgName, elts) {
        OrgClassification.resource.remove({
            orgName: orgName
            , categories: elts
        }, function (org) {
            $scope.org = org;
            Alert.addAlert("success", "Classification Deleted");
        });
    };

    $scope.openAddClassificationModal = function(orgName, pathArray) {
        $modal.open({
            animation: false,
            templateUrl: '/system/public/html/addClassification.html',
            controller: 'AddClassificationToOrgModalCtrl',
            resolve: {
                org: function() {
                    return orgName;
                } ,
                pathArray: function() {
                    return pathArray;
                }
            }
        }).result.then(function (newClassification) {
            if (newClassification) {
                newClassification.orgName = $scope.orgToManage;
                OrgClassification.resource.save(newClassification, function(response) {
                    if (response.error) {
                        Alert.addAlert("danger", response.error.message);
                    }
                    else {
                        $scope.org = response;
                        Alert.addAlert("success", "Classification Added");
                    }
                });
            }
        }, function () {});
    };

    $scope.openMeshMapping = function(orgName, pathArray) {
        $modal.open({
            animation: false,
            templateUrl: '/system/public/html/meshMappingMgt.html',
            controller: 'MeshMappingMgtCtrl',
            resolve: {
                org: function() {
                    return orgName;
                } ,
                pathArray: function() {
                    return pathArray;
                }
            }
        }).result.then(function () {}, function() {});
    };


    $scope.showRenameDialog = function(orgName, pathArray) {
        $modal.open({
            animation: false,
            templateUrl: 'renameClassificationModal.html',
            controller: ['$scope', 'classifName', function($scope, classifName) {
                $scope.classifName = classifName;
            }],
            resolve: {
                classifName: function() {
                    return pathArray[pathArray.length-1];
                }
            }
        }).result.then(function (newname) {
            if (newname) {
                Alert.addAlert("info", "Renaming in progress.");
                OrgClassification.rename(orgName, pathArray, newname, function(response) {
                    $scope.org = response;
                    Alert.addAlert("success", "Renaming complete.");
                });
            }
        }, function () {});
    };

    $scope.showRemoveClassificationModal = function(orgName, pathArray) {
        $modal.open({
            animation: false,
            templateUrl: '/system/public/html/removeClassificationMgtModal.html',
            controller: 'RemoveClassificationModalCtrl',
            resolve: {
                classifName: function() {
                    return pathArray[pathArray.length-1];
                },
                pathArray: function () {
                    return pathArray;
                },
                module: function () {
                    return $scope.module;
                }
            }
        }).result.then(function () {
            $scope.removeClassification(orgName, pathArray);
        }, function () {});
    };

    $scope.showClassifyEntireSearchModal = function (orgName, pathArray) {
        $modal.open({
            animation: false,
            templateUrl: '/system/public/html/classifyElt.html',
            controller: 'AddClassificationModalCtrl',
            resolve: {
                module: function() {
                    return $scope.module;
                }
                , cde: function () {
                    return null;
                }
                // @TODO: this is the only place of 5 where this dependency is used.
                , orgName: function() {
                    return orgName;
                }
                , pathArray: function() {
                    return pathArray;
                }
                , addClassification: function() {
                    return {
                        addClassification: function(newClassification) {
                            var oldClassification = {
                                orgName: orgName
                                , classifications: pathArray
                            };
                            $scope.classifyEntireSearch(oldClassification, newClassification);
                        }
                    };
                }
            }
        }).result.then(function () {}, function() {});
    };

    $scope.classifyEntireSearch = function(oldClassification, newClassification) {
        var settings = {
            resultPerPage: 10000
            , searchTerm: ""
            , selectedOrg: oldClassification.orgName
            , selectedElements: oldClassification.classifications
            , page: 1
            , selectedStatuses: SearchSettings.getUserDefaultStatuses()
        };

        var data = {
            query: settings
            , newClassification: newClassification
            , itemType: $scope.module
        };
        var timeout = $timeout(function() {
            Alert.addAlert("warning", "Classification task is still in progress. Please hold on.");
        }, 3000);
        $http({method: 'post', url: '/classifyEntireSearch', data: data}).then(function onSuccess(response) {
            $timeout.cancel(timeout);
            if (response.status === 200) Alert.addAlert("success", "Elements classified.");
            else Alert.addAlert("danger", response.data.error.message);
        }).catch(function onError() {
            Alert.addAlert("danger", "Task not performed completely!");
            $timeout.cancel(timeout);
        });
    };
}]);
