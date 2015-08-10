angular.module('systemModule').controller('ClassificationManagementCtrl', ['$scope', '$http', '$modal', 'OrgClassification', '$timeout', 'Elastic', 'userResource', 'SearchSettings', function($scope, $http, $modal, OrgClassification, $timeout, Elastic, userResource, SearchSettings) {
    $scope.module = "cde";
    $scope.classifSubEltPage = '/system/public/html/classif-elt-mgt.html';

    userResource.getPromise().then(function(){
        if (userResource.userOrgs.length > 0)  {
            $scope.orgToManage = userResource.userOrgs[0];
            $scope.userOrgs = userResource.userOrgs;
            $scope.updateOrg();
        }
    });



    $scope.org = {};

    $scope.updateOrg = function() {
        $timeout(function () {
            if ($scope.orgToManage !== undefined) {
                $http.get("/org/" + $scope.orgToManage).then(function(response) {
                    $scope.org = response.data;
                });
            }
        }, 0);
    };

    $scope.classificationToFilter = function() {
        return $scope.org.classifications;
    };

    $scope.removeClassification = function(orgName, elts) {
        OrgClassification.resource.remove({
            orgName: orgName
            , categories: elts
        }, function (org) {
            $scope.org = org;
            $scope.addAlert("success", "Classification Deleted");
        });
    };

    $scope.openAddClassificationModal = function(orgName, pathArray) {
        var modalInstance = $modal.open({
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
        });

        modalInstance.result.then(function (newClassification) {
            if (newClassification) {
                newClassification.orgName = $scope.orgToManage;
                OrgClassification.resource.save(newClassification, function(response) {
                    if (response.error) {
                        $scope.addAlert("danger", response.error.message);
                    }
                    else {
                        $scope.org = response;
                        $scope.addAlert("success", "Classification Added");
                    }
                });
            }
        });
    };

    $scope.showRenameDialog = function(orgName, pathArray) {
        var modalInstance = $modal.open({
            templateUrl: 'renameClassificationModal.html',
            controller: 'RenameClassificationModalCtrl',
            resolve: {
                classifName: function() {
                    return pathArray[pathArray.length-1];
                }
            }
        });

        modalInstance.result.then(function (newname) {
            if (newname) {
                OrgClassification.rename(orgName, pathArray, newname, function(response) {
                    $scope.org = response;
                });
            }
        });
    };

    $scope.showRemoveClassificationModal = function(orgName, pathArray) {
        var modalInstance = $modal.open({
            templateUrl: '/system/public/html/removeClassificationMgtModal.html',
            controller: 'RemoveClassificationModalCtrl',
            resolve: {
                classifName: function() {
                    return pathArray[pathArray.length-1];
                }
                , pathArray: function() {return pathArray;}
            }
        });

        modalInstance.result.then(function () {
            $scope.removeClassification(orgName, pathArray);
        });
    };

    $scope.showClassifyEntireSearchModal = function (orgName, pathArray) {
        var modalInstance = $modal.open({
            templateUrl: '/system/public/html/classifyCde.html',
            controller: 'AddClassificationModalCtrl',
            resolve: {
                module: function() {
                    return $scope.module;
                }
                , myOrgs: function() {
                    return userResource.userOrgs;
                }
                , cde: function() {
                    return {_id:null};
                }
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
        });

    };

    $scope.classifyEntireSearch = function(oldClassification, newClassification) {
        var settings = {
            resultPerPage: 1000000
            , searchTerm: ""
            , isSiteAdmin: null
            , myOrgs: []
            , selectedOrg: oldClassification.orgName
            , selectedElements: oldClassification.classifications
            , filter: {and: []}
            , currentPage: 1
            , visibleRegStatuses: SearchSettings.getUserDefaultStatuses()
        };

        var data = {
            query: settings
            , newClassification: newClassification
            , itemType: $scope.module
        };
        var timeout = $timeout(function() {
            $scope.addAlert("warning", "Classification task is still in progress. Please hold on.");
        }, 3000);
        $http({method: 'post', url: '/classifyEntireSearch', data: data}).success(function(data, status, headers, config) {
            $timeout.cancel(timeout);
            if (status===200) $scope.addAlert("success", "Elements classified.");
            else $scope.addAlert("danger", data.error.message);

        }).error(function(data) {
            $scope.addAlert("danger", "Task not performed completely!");
            $timeout.cancel(timeout);
        });
    };
}]);

angular.module('systemModule').controller('RenameClassificationModalCtrl', ['$scope', '$modalInstance', 'classifName', function($scope, $modalInstance, classifName) {
    $scope.classifName = classifName;
    $scope.close = function(newname) {
        $modalInstance.close(newname);
    };
}]);