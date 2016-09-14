angular.module('systemModule').controller('PropertiesCtrl',
    ['$scope', '$uibModal', '$location', '$timeout', 'OrgHelpers', 'Alert', '$q',
    function($scope, $modal, $location, $timeout, OrgHelpers, Alert, $q)
{

    $scope.$on('elementReloaded', function() {
        OrgHelpers.deferred.promise.then(function () {
            $scope.allContexts = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].nameContexts;
        });
    });

    $scope.openNewProperty = function () {
        if (!$scope.allKeys || $scope.allKeys.length === 0) {
            Alert.addAlert("warning", "No valid property keys present, have an Org Admin go to Org Management > List Management to add one");
            return;
        }

        var modalInstance;
            modalInstance = $modal.open({
                animation: false,
                templateUrl: 'newPropertyModalContent.html',
                controller: 'NewPropertyModalCtrl',
                resolve: {
                    elt: function () {
                        return $scope.elt;
                    },
                    module: function () {
                        return $scope.module;
                    }
                }
            });

        modalInstance.result.then(function (newProperty) {
            for (var i = 0; i < $scope.elt.properties.length; i++) {
                if ($scope.elt.properties[i].key === newProperty.key) {
                    $scope.addAlert("danger", "This property already exists.");
                    return;
                }
            }
            $scope.elt.properties.push(newProperty);
            if ($scope.elt.unsaved) {
                Alert.addAlert("info", "Property added. Save to confirm.");
            } else {
                $scope.elt.$save(function (newElt) {
                    $location.url($scope.baseLink + newElt.tinyId + "&tab=properties");
                    Alert.addAlert("success", "Property Added");
                });
            }
        });
    };
    
    $scope.removeProperty = function (index) {
        $scope.elt.properties.splice(index, 1);
        if ($scope.elt.unsaved) {
            $scope.addAlert("info", "Property removed. Save to confirm.");
        } else {
            $scope.elt.$save(function (newElt) {
                $location.url($scope.baseLink + newElt.tinyId + "&tab=properties");
                $scope.elt = newElt;
                Alert.addAlert("success", "Property Removed");
            });
        }
    };

    $scope.canEditProperty = function () {
        return $scope.canCurate && !$scope.elt.unsaved;
    };

    $scope.saveProperty = function() {
        $timeout(function() {
            $scope.elt.$save(function (newElt) {
                $location.url($scope.baseLink + newElt.tinyId + "&tab=properties");
                $scope.elt = newElt;
            });
        }, 0);
    };

}]);

angular.module('systemModule').controller('NewPropertyModalCtrl',
    ['$scope', '$uibModalInstance', 'module', 'elt', 'OrgHelpers',
    function ($scope, $modalInstance, module, elt, OrgHelpers) {

        OrgHelpers.deferred.promise.then(function () {
            $scope.orgPropertyKeys = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].propertyKeys;
        });

        $scope.elt = elt;
        $scope.newProperty = {};

        $scope.okCreate = function () {
            $modalInstance.close($scope.newProperty);
        };

        $scope.cancelCreate = function() {
            $modalInstance.dismiss("Cancel");
        };
}]);
