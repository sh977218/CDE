angular.module('cdeModule').controller('CdeCopyModalCtrl', ['$scope', 'elt', 'userResource', '$controller', '$modalInstance', function($scope, elt, userResource, $controller, $modalInstance) {
    elt.classification = [];
    delete elt.tinyId;
    delete elt._id;
    $scope.elt = JSON.parse(JSON.stringify(elt));
    $scope.origName = $scope.elt.naming[0].designation;
    $scope.myOrgs = userResource.userOrgs;
    $controller('CreateCdeAbstractCtrl', {$scope: $scope});

    $scope.saveCopy = function(){
        $scope.save();
        $modalInstance.close();
    };

    $scope.cancelCopy = function(){
        $modalInstance.close();
    };

}]);