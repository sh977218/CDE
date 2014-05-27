 function AddClassificationModalCtrl($scope, $modalInstance, $http, organizations) {
    $scope.organizations = organizations;  
    $scope.orgClassSystems = [];
    $scope.getOrgClassSystems = function () {
        $http.get("/autocomplete/classification/all").then(function(response) { 
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
