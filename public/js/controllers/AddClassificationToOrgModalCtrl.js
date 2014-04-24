function AddClassificationToOrgModalCtrl($scope, $modalInstance, $http, org) {
    $scope.orgClassSystems = [];
    $scope.getOrgClassSystems = function () {
        $http.get("/autocomplete/classification/org/" + org).then(function(response) { 
            $scope.orgClassSystems = response.data;
        });
    };
    $scope.getOrgClassSystems();
     
    $scope.okCreate = function (classification) {
      $modalInstance.close(classification);
    };

    $scope.cancelCreate = function () {
      $modalInstance.dismiss('cancel');
    };
}

