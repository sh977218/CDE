angular.module('systemModule').controller('ClassificationCtrl',
    ['$scope', '$uibModal', '$routeParams', '$q', 'CdeClassification', 'FormClassification', 'OrgHelpers', 'userResource',
        function ($scope, $modal, $routeParams, $promise, CdeClassification, FormClassification, OrgHelpers, userResource) {
    $scope.initCache();

    $scope.openAddClassificationModal = function () {
        $modal.open({
            animation: false,
            templateUrl: '/system/public/html/classifyElt.html',
            controller: 'AddClassificationModalCtrl',
            resolve: {
                module: function() {
                    return $scope.module;
                }
                , cde: function() {
                    return $scope.elt;
                }
                , orgName: function() {
                    return undefined;
                }
                , pathArray: function() {
                    return undefined;
                }
                , addClassification: function() {
                    return {
                        addClassification: function (newClassification, module) {
                            var classificationService = CdeClassification;
                            if (module === 'form') classificationService = FormClassification;
                            classificationService.save(newClassification, function (res) {
                                $scope.reload($routeParams);
                                $scope.addAlert("success", res.msg);
                            });

                        }
                    };
                }
            }
        });
    };

    $scope.removeClassification = function (orgName, module, elts) {
        var classificationService = CdeClassification;
        if (module === 'form') classificationService = FormClassification;
        classificationService.remove({
            cdeId: $scope.elt._id,
            orgName: orgName,
            categories: elts
        }).$promise.then(function (res) {
            $scope.reload($routeParams);
            $scope.addAlert("success", "Classification Deleted");
        });
    };

    $scope.hideWorkingGroups = function(stewardClassifications) {
        return !(OrgHelpers.showWorkingGroup(stewardClassifications.stewardOrg.name, userResource.user) ||
        ($scope.user && $scope.user.siteAdmin));
    };

    $scope.showRemoveClassificationModal = function(orgName, pathArray) {
        var modalInstance = $modal.open({
            templateUrl: '/system/public/html/removeClassificationModal.html',
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
        });

        modalInstance.result.then(function () {
            $scope.removeClassification(orgName, $scope.module, pathArray);
        });
    };
 }]);

angular.module("systemModule").controller('ClassLeafCtrl', ['$scope', function($scope){
    var j = JSON.parse(JSON.stringify($scope.pathArray));
    j.push($scope.elt.name);
    $scope.pathArray = j;
}]);
