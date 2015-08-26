angular.module('systemModule').controller('NamingCtrl', ['$scope', '$modal',
    function($scope, $modal)
{

    $scope.openNewNamePair = function () {
        $modal.open({
            templateUrl: 'newNamePairModalContent.html',
            controller: 'NewNamePairModalCtrl',
            resolve: {
                cde: function() {
                    return $scope.elt;
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