angular.module('cdeModule').controller('CdeCopyModalCtrl', ['$scope', 'elt', 'userResource', '$controller', '$modalInstance', function($scope, elt, userResource, $controller, $modalInstance) {
    elt.classification = [];
    delete elt.tinyId;
    delete elt._id;
    elt.ids = [];
    elt.registrationState.registrationStatus = "Incomplete";
    delete elt.registrationState.administrativeStatus;
    $scope.elt = JSON.parse(JSON.stringify(elt));
    $scope.origName = $scope.elt.naming[0].designation;
    $scope.elt.naming[0].designation = "Copy of: " + $scope.elt.naming[0].designation;
    $scope.myOrgs = userResource.userOrgs;
    $controller('CreateCdeAbstractCtrl', {$scope: $scope});

    $scope.saveCopy = function(){
        $scope.save();
        $modalInstance.close();
    };

    $scope.cancelCopy = function(){
        $modalInstance.close();
    };

    $scope.isNameNew = function(){
        return $scope.origName !== $scope.elt.naming[0].designation;
    };

}]);