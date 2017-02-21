angular.module('systemModule').controller('PropertiesCtrl',
    ['$scope', '$uibModal', '$location', '$timeout', 'OrgHelpers', 'Alert', '$q',
    function($scope, $modal, $location, $timeout, OrgHelpers, Alert, $q)
{
    var keysLoaded = $q.defer();

    function refreshKeys(){
        OrgHelpers.deferred.promise.then(function () {
            $scope.allKeys = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].propertyKeys;
            keysLoaded.resolve();
        });
    }

    $scope.deferredEltLoaded.promise.then(refreshKeys);

    $scope.openNewProperty = function () {
        keysLoaded.promise.then(function () {
            if (!$scope.allKeys || $scope.allKeys.length === 0) {
                Alert.addAlert("warning", "No valid property keys present, have an Org Admin go to Org Management > List Management to add one");
                return;
            }

            $modal.open({
                animation: false,
                templateUrl: 'newPropertyModalContent.html',
                controller: ['$scope', 'elt', 'OrgHelpers',
                    function ($scope, elt, OrgHelpers) {
                        $scope.elt = elt;
                        OrgHelpers.deferred.promise.then(function () {
                            $scope.orgPropertyKeys = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].propertyKeys;
                        });
                        $scope.newProperty = {};
                    }],
                resolve: {
                    elt: function () {
                        return $scope.elt;
                    }
                }
            }).result.then(function (newProperty) {
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
                        $scope.elt = newElt;
                        Alert.addAlert("success", "Property Added");
                    });
                }
            }, function () {});
        });
    };
    
    $scope.removeProperty = function (index) {
        $scope.elt.properties.splice(index, 1);
        if ($scope.elt.unsaved) {
            $scope.addAlert("info", "Property removed. Save to confirm.");
        } else {
            $scope.elt.$save(function (newElt) {
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
                Alert.addAlert("success", "Saved");
                $scope.elt = newElt;
            });
        }, 0);
    };

}]);
