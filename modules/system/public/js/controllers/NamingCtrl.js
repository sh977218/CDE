angular.module('systemModule').controller('NamingCtrl', ['$scope', '$uibModal', 'OrgHelpers', 'Alert',
    function ($scope, $modal, OrgHelpers, Alert) {

        $scope.allContexts = OrgHelpers.orgsDetailedInfo[$scope.elt.stewardOrg.name].nameContexts;

        $scope.openNewNamePair = function () {
            if (!$scope.allContexts || $scope.allContexts.length === 0) {
                Alert.addAlert("warning", "No valid context present, have an Org Admin go to Org Management > List Management to add one");
                return;
            }

        $modal.open({
            animation: false,
            templateUrl: 'newNamePairModalContent.html',
            controller: 'NewNamePairModalCtrl',
            resolve: {
                cde: function() {
                    return $scope.elt;
                },
                context: function () {
                    return $scope.allContexts;
                }
            }
        });
    };

    $scope.stageNewName = function(namePair) {
        $scope.stageElt($scope.elt);
        namePair.editMode = false;
    };

    $scope.cancelSave = function(namePair) {
        namePair.editMode = false;
    };

    $scope.removeNamePair = function(index) {
        $scope.elt.naming.splice(index, 1);
        $scope.stageElt($scope.elt);
    };

}]);