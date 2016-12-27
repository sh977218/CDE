angular.module('formModule').controller('DisplayProfileCtrl', ['$scope', function($scope)
{

    $scope.addProfile = function() {
        var newProfile = {
            name: "New Profile",
            displayInstructions: true,
            displayNumbering: true,
            sectionsAsMatrix: true,
            displayType: 1,
            numberOfColumns: 4
        };
        var elt = $scope.elt;
        if (!elt.displayProfiles) elt.displayProfiles = [newProfile];
        else {
            elt.displayProfiles.push(newProfile);
        }
        $scope.stageElt();
    };

    $scope.removeDisplayProfile = function (index) {
        $scope.elt.displayProfiles.splice(index, 1);
        $scope.stageElt();
    };


}]);